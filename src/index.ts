import {
  CallExpression,
  ExpressionStatement,
  ImportDeclaration,
  Node,
  ObjectLiteralExpression,
  type SourceFile,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  const importDeclarations = collectZodImportDeclarations(sourceFile);

  importDeclarations.forEach((declaration) => {
    declaration.setModuleSpecifier("zod/v4");
  });

  collectZodReferences(importDeclarations).forEach((node) => {
    const parentStatement =
      node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement) ??
      node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);

    convertErrorMapToErrorFunction(parentStatement);
    convertMessageKeyToError(parentStatement);
    convertDeprecatedErrorKeysToErrorFunction(parentStatement);

    const parentType = node.getFirstAncestorByKind(SyntaxKind.QualifiedName);
    parentType?.getRight().replaceWithText("ZodJSONSchema");

    convertZNumberPatternsToZInt(parentStatement);
  });

  convertZodErrorToTreeifyError(sourceFile);
  convertZodErrorAddIssueToDirectPushes(sourceFile);

  return sourceFile.getFullText();
}

function convertZodErrorToTreeifyError(sourceFile: SourceFile) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();
      const looksLikeZodErrorFormat =
        methodCalled?.getText() === "format" && argsCount === 0;
      const looksLikeZodErrorFlatten =
        methodCalled?.getText() === "flatten" && argsCount === 0;

      // TODO: prevent matches that don't belong to Zod

      return looksLikeZodErrorFormat || looksLikeZodErrorFlatten;
    })
    .forEach((expression) => {
      const caller =
        expression.getFirstChild()?.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`z.treeifyError(${caller})`);
    });

  sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((expression) => {
      const looksLikeZodErrorFormErrors = expression.getName() === "formErrors";

      // TODO: prevent matches that don't belong to Zod

      return looksLikeZodErrorFormErrors;
    })
    .forEach((expression) => {
      const caller = expression.getFirstChild()?.getText() ?? "";
      expression.replaceWithText(`z.treeifyError(${caller})`);
    });
}

function convertZodErrorAddIssueToDirectPushes(sourceFile: SourceFile) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expression) => {
      const argsCount = expression.getArguments().length;
      const methodCalled = expression.getExpression().getLastChild();
      const looksLikeZodErrorAddIssue =
        methodCalled?.getText() === "addIssue" && argsCount === 1;
      const looksLikeZodErrorAddIssues =
        methodCalled?.getText() === "addIssues" && argsCount === 1;

      // TODO: prevent matches that don't belong to Zod

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

function convertMessageKeyToError(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  node
    ?.getDescendantsOfKind(SyntaxKind.Identifier)
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
      messageProp?.remove();
      objectLiteral.addPropertyAssignment({
        name: "error",
        initializer: messageValue ?? "",
      });

      // If other error keys exist, `message` takes precedence in v3
      const requiredErrorProp = objectLiteral.getProperty("required_error");
      const invalidTypeErrorProp =
        objectLiteral.getProperty("invalid_type_error");
      requiredErrorProp?.remove();
      invalidTypeErrorProp?.remove();
    });
}

function convertZNumberPatternsToZInt(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  node
    ?.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((e) => e.getName() === "number")
    // Get the full `z.number().X().Y()` call chain
    .map((expression) =>
      expression.getParentWhile(
        (parent) =>
          parent.isKind(SyntaxKind.PropertyAccessExpression) ||
          parent.isKind(SyntaxKind.CallExpression),
      ),
    )
    .filter((e): e is CallExpression => !!e?.isKind(SyntaxKind.CallExpression))
    // Only keep the ones with `.int()` and `.safe()` inside
    .filter((expression) =>
      expression.getDescendants().some((child) => {
        const looksLikeZodNumberInt =
          child.isKind(SyntaxKind.PropertyAccessExpression) &&
          child.getName() === "int";
        const looksLikeZodNumberSafe =
          child.isKind(SyntaxKind.PropertyAccessExpression) &&
          child.getName() === "safe";

        return looksLikeZodNumberInt || looksLikeZodNumberSafe;
      }),
    )
    .forEach((expression) => {
      // Remove `.int()` and `.safe()` from the chain
      expression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter(
          (expression) =>
            expression.getName() === "int" || expression.getName() === "safe",
        )
        .forEach((expression) => {
          const parent = expression.getFirstAncestorByKind(
            SyntaxKind.CallExpression,
          );
          parent?.replaceWithText(expression.getExpression().getText());
        });

      // Replace `z.number()` with `z.int()`
      expression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((e) => e.getName() === "number")
        .forEach((e) => {
          e.replaceWithText("z.int");
        });
    });
}

function convertDeprecatedErrorKeysToErrorFunction(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  node
    ?.getDescendantsOfKind(SyntaxKind.Identifier)
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
      const requiredErrorValue = requiredErrorProp
        ?.getLastChildIfKind(SyntaxKind.StringLiteral)
        ?.getText();

      const invalidTypeErrorProp =
        objectLiteral.getProperty("invalid_type_error");
      const invalidTypeErrorValue = invalidTypeErrorProp
        ?.getLastChildIfKind(SyntaxKind.StringLiteral)
        ?.getText();

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

function convertErrorMapToErrorFunction(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  // Find all errorMap properties
  node
    ?.getDescendantsOfKind(SyntaxKind.Identifier)
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

      const issueParam = errorMapFunction.getParameters()[0]?.getName();
      const contextParam = errorMapFunction.getParameters()[1]?.getName();
      if (!issueParam) {
        return;
      }

      const functionBody = errorMapFunction.getBody();
      if (!functionBody) {
        return;
      }

      let hasOnlyDefaultReturns = true;
      const returnStatements = functionBody.getDescendantsOfKind(
        SyntaxKind.ReturnStatement,
      );
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

        const messageValueText = messageProp.getLastChild()?.getText();
        if (messageValueText === `${contextParam}.defaultError`) {
          statement.replaceWithText("return;");
        } else {
          statement.replaceWithText(`return ${messageValueText};`);
          hasOnlyDefaultReturns = false;
        }
      });

      // If it only has default returns, we don't need an error function
      if (hasOnlyDefaultReturns) {
        errorMapProp?.remove();
        return;
      }

      objectLiteral.addPropertyAssignment({
        name: "error",
        initializer: `(${issueParam}) => ${functionBody.getText()}`,
      });
      errorMapProp?.remove();
    });
}

function collectZodReferences(importDeclarations: ImportDeclaration[]) {
  return importDeclarations.flatMap((importDeclaration) =>
    importDeclaration.getNamedImports().flatMap((namedImport) => {
      const namedNode = namedImport.getNameNode();
      if (!namedNode.isKind(SyntaxKind.Identifier)) {
        return [];
      }

      return namedNode
        .findReferencesAsNodes()
        .filter((node) => node !== namedNode);
    }),
  );
}

function collectZodImportDeclarations(sourceFile: SourceFile) {
  return sourceFile
    .getImportDeclarations()
    .filter((importDeclaration) =>
      ["zod", "zod/v4"].includes(importDeclaration.getModuleSpecifierValue()),
    );
}
