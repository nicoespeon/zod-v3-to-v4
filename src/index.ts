import { type SourceFile, SyntaxKind } from "ts-morph";
import {
  collectZodImportDeclarations,
  collectZodReferences,
  getZodName,
} from "./collect-imports.js";
import {
  convertZNumberPatternsToZInt,
  convertZStringPatternsToTopLevelApi,
} from "./convert-name-to-top-level-api.js";
import {
  convertDeprecatedErrorKeysToErrorFunction,
  convertErrorMapToErrorFunction,
  convertMessageKeyToError,
  convertZodErrorAddIssueToDirectPushes,
  convertZodErrorToTreeifyError,
} from "./convert-zod-errors.js";

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  const importDeclarations = collectZodImportDeclarations(sourceFile);
  const zodName = getZodName(importDeclarations);

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

    convertZNumberPatternsToZInt(parentStatement, zodName);
    convertZStringPatternsToTopLevelApi(parentStatement, zodName);
  });

  convertZodErrorToTreeifyError(sourceFile, zodName);
  convertZodErrorAddIssueToDirectPushes(sourceFile);

  return sourceFile.getFullText();
}
