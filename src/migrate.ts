import {
  type ImportDeclaration,
  type Node,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import { ZodIssueCode } from "zod/v3";
import { findRootExpression } from "./ast.ts";
import {
  collectZodImportDeclarations,
  collectZodReferences,
  getZodName,
} from "./collect-imports.ts";
import {
  convertZArrayPatternsToTopLevelApi,
  convertZCoercePatternsToTopLevelApi,
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

interface Options {
  migrateImportDeclarations?: boolean;
}

export function migrateZodV3ToV4(
  sourceFile: SourceFile,
  options: Options = {},
): string | undefined {
  const importDeclarations = collectZodImportDeclarations(sourceFile);
  const zodName = getZodName(importDeclarations);

  importDeclarations.forEach((declaration) => {
    if (declaration.getModuleSpecifier().getText() === "zod/v3") {
      declaration.setModuleSpecifier("zod");
    }

    if (options.migrateImportDeclarations) {
      // Use `zod/v4` explicit import. Not needed for an actual migration.
      // Useful for testing, so we can have v3.25 and typecheck both v3 and v4
      declaration.setModuleSpecifier("zod/v4");
    }
  });

  // Collect references before modifying imports
  const zodReferences = collectZodReferences(importDeclarations);

  replaceDeletedTypes(importDeclarations, zodReferences);

  zodReferences.forEach((node) => {
    if (node.wasForgotten()) {
      return;
    }

    const parentType = node.getFirstAncestorByKind(SyntaxKind.QualifiedName);
    if (parentType?.getText().endsWith("ZodSchema")) {
      parentType?.getRight().replaceWithText("ZodType");
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
    convertZCoercePatternsToTopLevelApi(parentStatement, zodName);
    convertZObjectPatternsToTopLevelApi(parentStatement, zodName);
    convertZArrayPatternsToTopLevelApi(parentStatement, zodName);
    convertZFunctionPatternsToTopLevelApi(parentStatement);
    convertZRecordPatternsToTopLevelApi(parentStatement, zodName);
    renameZDefaultToZPrefault(parentStatement);
    renameZNativeEnumToZEnum(parentStatement);
    replaceZodIssueCodeWithLiteralStrings(parentStatement);
  });

  convertZodErrorToTreeifyError(sourceFile, zodName);
  convertZodErrorAddIssueToDirectPushes(sourceFile, zodName);
  renameZSchemaEnumToLowercase(sourceFile, zodName);

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

function renameZSchemaEnumToLowercase(sourceFile: SourceFile, zodName: string) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((node) => node.getName() === "Enum")
    .filter((node) => {
      const rootNode = findRootExpression(node);
      const expression = rootNode?.getExpression();

      const isFromZodEnum =
        expression?.isKind(SyntaxKind.PropertyAccessExpression) &&
        expression.getName() === "enum" &&
        expression.getExpression().getText() === zodName;

      return isFromZodEnum;
    })
    .forEach((node) => {
      node.getNameNode().replaceWithText("enum");
    });
}

const ZodIssueCodeToLiteralString: Record<string, string> = {
  custom: "custom",
  invalid_type: "invalid_type",
  unrecognized_keys: "unrecognized_keys",
  too_big: "too_big",
  too_small: "too_small",
  not_multiple_of: "not_multiple_of",
  invalid_union: "invalid_union",
  invalid_literal: "invalid_type",
  invalid_union_discriminator: "invalid_union",
  invalid_enum_value: "invalid_type",
  invalid_arguments: "invalid_type",
  invalid_return_type: "invalid_type",
  invalid_date: "invalid_type",
  invalid_string: "invalid_type",
  invalid_intersection_types: "invalid_type",
  not_finite: "invalid_type",
  // Use satisfies to make sure we cover all cases, without hijacking the type
} satisfies Record<ZodIssueCode, string>;

function replaceZodIssueCodeWithLiteralStrings(node: ZodNode) {
  node
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((e) => e.getName() === "ZodIssueCode")
    .flatMap((e) => e.getParentIfKind(SyntaxKind.PropertyAccessExpression))
    .filter((e) => e !== undefined)
    .forEach((e) => {
      const literalString =
        ZodIssueCodeToLiteralString[e.getName()] ?? "invalid_type";
      e.replaceWithText(`"${literalString}"`);
    });
}

const DELETED_TYPES = [
  {
    name: "AnyZodObject",
    replacement: "ZodRecord<any, any>",
    importName: "ZodRecord",
  },
] as const;

function replaceDeletedTypes(
  importDeclarations: ImportDeclaration[],
  zodReferences: Node[],
) {
  // Update imports: remove deleted types and add replacements
  importDeclarations.forEach((declaration) => {
    const namedImports = declaration.getNamedImports();
    for (const { name, importName } of DELETED_TYPES) {
      const deletedImport = namedImports.find((i) => i.getName() === name);
      if (deletedImport) {
        const hasReplacementImport = namedImports.some(
          (i) => i.getName() === importName,
        );
        deletedImport.remove();
        if (!hasReplacementImport) {
          declaration.addNamedImport(importName);
        }
      }
    }
  });

  // Replace references in code
  zodReferences.forEach((node) => {
    if (node.wasForgotten()) {
      return;
    }
    for (const { name, replacement } of DELETED_TYPES) {
      if (node.getText() === name) {
        node.replaceWithText(replacement);
        return;
      }
    }
  });
}
