import { type SourceFile, SyntaxKind } from "ts-morph";
import {
  collectZodImportDeclarations,
  collectZodReferences,
  getZodName,
} from "./collect-imports.ts";
import {
  convertZArrayPatternsToTopLevelApi,
  convertZFunctionPatternsToTopLevelApi,
  convertZNumberPatternsToZInt,
  convertZObjectPatternsToTopLevelApi,
  convertZRecordPatternsToTopLevelApi,
  convertZStringPatternsToTopLevelApi,
} from "./convert-name-to-top-level-api.ts";
import {
  convertDeprecatedErrorKeysToErrorFunction,
  convertErrorMapToErrorFunction,
  convertMessageKeyToError,
  convertZodErrorAddIssueToDirectPushes,
  convertZodErrorToTreeifyError,
} from "./convert-zod-errors.ts";
import { isZodNode, type ZodNode } from "./zod-node.ts";

export function migrateZodV3ToV4(sourceFile: SourceFile): string | undefined {
  const importDeclarations = collectZodImportDeclarations(sourceFile);
  const zodName = getZodName(importDeclarations);

  importDeclarations.forEach((declaration) => {
    declaration.setModuleSpecifier("zod/v4");
  });

  collectZodReferences(importDeclarations).forEach((node) => {
    if (node.wasForgotten()) {
      return;
    }

    const parentType = node.getFirstAncestorByKind(SyntaxKind.QualifiedName);
    if (parentType?.getText().endsWith("ZodSchema")) {
      parentType?.getRight().replaceWithText("ZodJSONSchema");
    }

    const parentStatement = node.getParentWhile(isZodNode) || node;
    if (!isZodNode(parentStatement)) {
      return;
    }

    convertErrorMapToErrorFunction(parentStatement);
    convertMessageKeyToError(parentStatement);
    convertDeprecatedErrorKeysToErrorFunction(parentStatement);
    convertZNumberPatternsToZInt(parentStatement, zodName);
    convertZStringPatternsToTopLevelApi(parentStatement, zodName);
    convertZObjectPatternsToTopLevelApi(parentStatement, zodName);
    convertZArrayPatternsToTopLevelApi(parentStatement, zodName);
    convertZFunctionPatternsToTopLevelApi(parentStatement);
    convertZRecordPatternsToTopLevelApi(parentStatement, zodName);
    renameZDefaultToZPrefault(parentStatement);
    renameZNativeEnumToZEnum(parentStatement);
  });

  convertZodErrorToTreeifyError(sourceFile, zodName);
  convertZodErrorAddIssueToDirectPushes(sourceFile);

  return sourceFile.getFullText();
}

function renameZDefaultToZPrefault(node: ZodNode) {
  node
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAccessExpression) &&
        id.getText() === "default",
    )
    .forEach((identifier) => {
      identifier.replaceWithText("prefault");
    });
}

function renameZNativeEnumToZEnum(node: ZodNode) {
  node
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getParentIfKind(SyntaxKind.PropertyAccessExpression) &&
        id.getText() === "nativeEnum",
    )
    .forEach((identifier) => {
      identifier.replaceWithText("enum");
    });
}
