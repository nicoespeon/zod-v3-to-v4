import {
  Node,
  ObjectLiteralExpression,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import {
  getDirectDescendantsOfKind,
  isZodReference,
  type ZodNode,
} from "./zod-node.ts";

export function convertErrorMapToErrorFunction(node: ZodNode) {
  // Find all errorMap properties
  getDirectDescendantsOfKind(node, SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAssignment) &&
        id.getText() === "errorMap",
    )
    .map((id) =>
      id.getParent()?.getParentIfKind(SyntaxKind.ObjectLiteralExpression),
    )
    .filter(
      (objectLiteral): objectLiteral is ObjectLiteralExpression =>
        objectLiteral !== undefined,
    )
    .forEach((objectLiteral) => {
      const errorMapProp = objectLiteral.getProperty("errorMap");
      const errorMapFunction = errorMapProp?.getLastChildIfKind(
        SyntaxKind.ArrowFunction,
      );

      if (!errorMapFunction) {
        return;
      }

      const issueParam = errorMapFunction.getParameters()[0]?.getName() ?? "";
      const contextParam = errorMapFunction.getParameters()[1]?.getName() ?? "";

      const functionBody = errorMapFunction.getBody();
      if (!functionBody) {
        return;
      }

      let hasOnlyDefaultReturns = true;

      const returnStatements = functionBody.isKind(
        SyntaxKind.ParenthesizedExpression,
      )
        ? [functionBody]
        : functionBody.getDescendantsOfKind(SyntaxKind.ReturnStatement);
      returnStatements.forEach((statement) => {
        const expression = statement.getExpression();

        if (!expression?.isKind(SyntaxKind.ObjectLiteralExpression)) {
          hasOnlyDefaultReturns = false;
          return;
        }

        const messageProp = expression.getProperty("message");
        if (!messageProp) {
          hasOnlyDefaultReturns = false;
          return;
        }

        const messageValueText = messageProp.getLastChild()?.getText() ?? `""`;
        if (messageValueText === `${contextParam}.defaultError`) {
          statement.replaceWithText("return;");
        } else {
          const newText = statement.isKind(SyntaxKind.ParenthesizedExpression)
            ? messageValueText
            : `return ${messageValueText};`;
          statement.replaceWithText(newText);
          hasOnlyDefaultReturns = false;
        }
      });

      // If it only has default returns, we don't need an error function
      if (hasOnlyDefaultReturns) {
        errorMapProp?.remove();
        return;
      }

      if (functionBody.wasForgotten()) {
        errorMapProp
          ?.getDescendantsOfKind(SyntaxKind.Identifier)
          .filter((id) => id.getText() === "errorMap")
          .forEach((id) => id.replaceWithText("error"));
      } else {
        objectLiteral.addPropertyAssignment({
          name: "error",
          initializer: `(${issueParam}) => ${functionBody.getText()}`,
        });
        errorMapProp?.remove();
      }
    });
}

export function convertMessageKeyToError(node: ZodNode) {
  getDirectDescendantsOfKind(node, SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAssignment) &&
        id.getText() === "message",
    )
    .map((id) =>
      id.getParent()?.getParentIfKind(SyntaxKind.ObjectLiteralExpression),
    )
    .filter(
      (objectLiteral): objectLiteral is ObjectLiteralExpression =>
        objectLiteral !== undefined,
    )
    .forEach((objectLiteral) => {
      const messageProp = objectLiteral.getProperty("message");
      const messageValue = messageProp
        ?.getLastChildIfKind(SyntaxKind.StringLiteral)
        ?.getText();
      if (!messageValue) {
        return;
      }

      messageProp?.remove();
      objectLiteral.addPropertyAssignment({
        name: "error",
        initializer: messageValue,
      });

      // If other error keys exist, `message` takes precedence in v3
      const requiredErrorProp = objectLiteral.getProperty("required_error");
      const invalidTypeErrorProp =
        objectLiteral.getProperty("invalid_type_error");
      requiredErrorProp?.remove();
      invalidTypeErrorProp?.remove();
    });
}

export function convertDeprecatedErrorKeysToErrorFunction(node: ZodNode) {
  getDirectDescendantsOfKind(node, SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAssignment) &&
        (id.getText() === "required_error" ||
          id.getText() === "invalid_type_error"),
    )
    .map((id) =>
      id.getParent()?.getParentIfKind(SyntaxKind.ObjectLiteralExpression),
    )
    .filter(
      (objectLiteral): objectLiteral is ObjectLiteralExpression =>
        objectLiteral !== undefined,
    )
    .forEach((objectLiteral) => {
      const requiredErrorProp = objectLiteral.getProperty("required_error");
      const requiredErrorValue = (
        requiredErrorProp?.getLastChildIfKind(SyntaxKind.StringLiteral) ||
        requiredErrorProp?.getLastChildIfKind(SyntaxKind.Identifier)
      )?.getText();

      const invalidTypeErrorProp =
        objectLiteral.getProperty("invalid_type_error");
      const invalidTypeErrorValue = (
        invalidTypeErrorProp?.getLastChildIfKind(SyntaxKind.StringLiteral) ||
        invalidTypeErrorProp?.getLastChildIfKind(SyntaxKind.Identifier)
      )?.getText();

      if (!requiredErrorProp && !invalidTypeErrorProp) {
        return;
      }

      let errorFunctionText = `(issue) => `;
      if (requiredErrorProp && invalidTypeErrorProp) {
        errorFunctionText += `issue.input === undefined ? ${requiredErrorValue} : ${invalidTypeErrorValue}`;
      } else if (requiredErrorProp) {
        errorFunctionText += `issue.input === undefined ? ${requiredErrorValue} : undefined`;
      } else if (invalidTypeErrorProp) {
        errorFunctionText += `issue.input === undefined ? undefined : ${invalidTypeErrorValue}`;
      }

      requiredErrorProp?.remove();
      invalidTypeErrorProp?.remove();
      objectLiteral.addPropertyAssignment({
        name: "error",
        initializer: errorFunctionText,
      });
    });
}

export function convertZodErrorToTreeifyError(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodJSONSchema", "ZodError"], expression),
    )
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();

      const looksLikeZodErrorFormat =
        methodCalled?.getText() === "format" && argsCount === 0;
      const looksLikeZodErrorFlatten =
        methodCalled?.getText() === "flatten" && argsCount === 0;

      return looksLikeZodErrorFormat || looksLikeZodErrorFlatten;
    })
    .forEach((expression) => {
      const caller =
        expression.getFirstChild()?.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`${zodName}.treeifyError(${caller})`);
    });

  sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodJSONSchema", "ZodError"], expression),
    )
    .filter((expression) => {
      const looksLikeZodErrorFormErrors = expression.getName() === "formErrors";

      return looksLikeZodErrorFormErrors;
    })
    .forEach((expression) => {
      const caller = expression.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`${zodName}.treeifyError(${caller})`);
    });
}

export function convertZodErrorAddIssueToDirectPushes(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodJSONSchema", "ZodError"], expression),
    )
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();

      const looksLikeZodErrorAddIssue =
        methodCalled?.getText() === "addIssue" && argsCount === 1;
      const looksLikeZodErrorAddIssues =
        methodCalled?.getText() === "addIssues" && argsCount === 1;

      return looksLikeZodErrorAddIssue || looksLikeZodErrorAddIssues;
    })
    .forEach((expression) => {
      const caller =
        expression.getFirstChild()?.getFirstChild()?.getText() ?? "";
      const argument = expression.getArguments()[0];
      if (!argument) {
        return;
      }

      convertZodIssueToV4(argument);

      const newArgument = argument.isKind(SyntaxKind.ArrayLiteralExpression)
        ? argument
            .getElements()
            .map((element) => element.getText())
            .join(",\n")
        : argument.getText();

      expression.replaceWithText(`${caller}.issues.push(${newArgument})`);
    });
}

function convertZodIssueToV4(node: Node) {
  if (node.isKind(SyntaxKind.ArrayLiteralExpression)) {
    const arrayElements = node.getElements();
    arrayElements.forEach((element) => {
      convertZodIssueToV4(element);
    });
    return;
  }

  if (!node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return;
  }

  node.addPropertyAssignment({
    name: "input",
    initializer: "''",
  });

  const typeProperty = node.getProperty("type");
  if (typeProperty && typeProperty.isKind(SyntaxKind.PropertyAssignment)) {
    typeProperty.rename("origin");
  }
}
