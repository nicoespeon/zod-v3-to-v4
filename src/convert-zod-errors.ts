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

export function convertSetErrorMapToConfig(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) => {
      const callee = expression.getExpression();
      if (!callee.isKind(SyntaxKind.PropertyAccessExpression)) {
        return false;
      }

      const objectName = callee.getExpression().getText();
      const methodName = callee.getName();

      return objectName === zodName && methodName === "setErrorMap";
    })
    .forEach((expression) => {
      const argument = expression.getArguments()[0];
      if (!argument) {
        return;
      }

      expression.replaceWithText(
        `${zodName}.config({ customError: ${argument.getText()} })`,
      );
    });
}

export function convertZodErrorMapType(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .filter((typeRef) => {
      const typeName = typeRef.getTypeName();
      if (!typeName.isKind(SyntaxKind.QualifiedName)) {
        return false;
      }

      const left = typeName.getLeft().getText();
      const right = typeName.getRight().getText();
      return left === zodName && right === "ZodErrorMap";
    })
    .forEach((typeRef) => {
      typeRef.replaceWithText(`${zodName}.core.$ZodErrorMap`);
    });
}

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

export function convertRefineFunctionParamsToObject(node: ZodNode) {
  getDirectDescendantsOfKind(node, SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAccessExpression) &&
        id.getText() === "refine",
    )
    .map((id) => id.getParent()?.getParentIfKind(SyntaxKind.CallExpression))
    .filter((callExpr) => callExpr !== undefined)
    .forEach((callExpr) => {
      const secondArg = callExpr.getArguments()[1];
      if (!secondArg?.isKind(SyntaxKind.ArrowFunction)) {
        return;
      }

      if (secondArg.getParameters().length > 0) {
        return;
      }

      const body = secondArg.getBody();
      if (body.isKind(SyntaxKind.ParenthesizedExpression)) {
        const inner = body.getExpression();
        if (inner.isKind(SyntaxKind.ObjectLiteralExpression)) {
          secondArg.replaceWithText(inner.getText());
        }
      } else if (body.isKind(SyntaxKind.Block)) {
        const statements = body.getStatements();
        if (statements.length !== 1) {
          return;
        }
        const stmt = statements[0]!;
        if (!stmt.isKind(SyntaxKind.ReturnStatement)) {
          return;
        }
        const expr = stmt.getExpression();
        if (expr?.isKind(SyntaxKind.ObjectLiteralExpression)) {
          secondArg.replaceWithText(expr.getText());
        }
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
      const requiredErrorValue = requiredErrorProp?.isKind(
        SyntaxKind.PropertyAssignment,
      )
        ? requiredErrorProp.getInitializer()?.getText()
        : undefined;

      const invalidTypeErrorProp =
        objectLiteral.getProperty("invalid_type_error");
      const invalidTypeErrorValue = invalidTypeErrorProp?.isKind(
        SyntaxKind.PropertyAssignment,
      )
        ? invalidTypeErrorProp.getInitializer()?.getText()
        : undefined;

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

export function convertZodErrorFormatToTreeifyError(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodType", "ZodError"], expression),
    )
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();
      return methodCalled?.getText() === "format" && argsCount === 0;
    })
    .forEach((expression) => {
      const caller =
        expression.getFirstChild()?.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`${zodName}.treeifyError(${caller})`);
    });
}

export function convertZodErrorFlattenToFlattenError(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodType", "ZodError"], expression),
    )
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();
      return methodCalled?.getText() === "flatten" && argsCount === 0;
    })
    .forEach((expression) => {
      const caller =
        expression.getFirstChild()?.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`${zodName}.flattenError(${caller})`);
    });

  sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodType", "ZodError"], expression),
    )
    .filter((expression) => expression.getName() === "formErrors")
    .forEach((expression) => {
      const caller = expression.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`${zodName}.flattenError(${caller})`);
    });
}

export function convertZodErrorAddIssueToDirectPushes(
  sourceFile: SourceFile,
  zodName: string,
) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodType", "ZodError"], expression),
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

  sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((expression) =>
      isZodReference(zodName, ["ZodType", "ZodError"], expression),
    )
    .filter((expression) => expression.getName() === "errors")
    .forEach((expression) => {
      expression.getNameNode().replaceWithText("issues");
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
