import { type ImportDeclaration, type Node, SyntaxKind } from "ts-morph";

interface DeletedType {
  name: string;
  importName: string;
  getReplacement: (node: Node) => string;
}

const DELETED_TYPES: DeletedType[] = [
  {
    name: "AnyZodObject",
    importName: "ZodRecord",
    getReplacement: () => "ZodRecord<any, any>",
  },
  {
    name: "SafeParseReturnType",
    importName: "ZodSafeParseResult",
    getReplacement: (node) => {
      // SafeParseReturnType<I, O> -> ZodSafeParseResult<O>
      // Keep only the second type argument for consistency
      // See https://github.com/colinhacks/zod/issues/5195
      const typeRef = node.getFirstAncestorByKind(SyntaxKind.TypeReference);
      const secondArg = typeRef?.getTypeArguments()?.[1];
      return secondArg
        ? `ZodSafeParseResult<${secondArg.getText()}>`
        : "ZodSafeParseResult<unknown>";
    },
  },
];

export function replaceDeletedTypes(
  importDeclarations: ImportDeclaration[],
  zodReferences: Node[],
) {
  // Update imports: remove deleted types and add replacements
  importDeclarations.forEach((declaration) => {
    for (const { name, importName } of DELETED_TYPES) {
      const namedImports = declaration.getNamedImports();
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

    for (const { name, getReplacement } of DELETED_TYPES) {
      if (node.getText() === name) {
        const typeRef = node.getFirstAncestorByKind(SyntaxKind.TypeReference);
        if (typeRef) {
          typeRef.replaceWithText(getReplacement(node));
        } else {
          node.replaceWithText(getReplacement(node));
        }
        return;
      }
    }
  });
}
