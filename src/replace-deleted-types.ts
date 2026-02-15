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
  {
    name: "ZodTypeAny",
    importName: "ZodType",
    getReplacement: () => "ZodType",
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

  // ZodType<Output, Def, Input> → ZodType<Output, Input>
  convertZodTypeGenerics(zodReferences);

  // Replace references in code
  zodReferences.forEach((node) => {
    if (node.wasForgotten()) {
      return;
    }

    for (const { name, importName, getReplacement } of DELETED_TYPES) {
      // Handle direct imports (e.g., `import { AnyZodObject }`)
      if (node.getText() === name) {
        const typeRef = node.getFirstAncestorByKind(SyntaxKind.TypeReference);
        if (typeRef) {
          typeRef.replaceWithText(getReplacement(node));
        } else {
          node.replaceWithText(getReplacement(node));
        }
        return;
      }

      // Handle prefixed access (e.g., `z.AnyZodObject`)
      const qualifiedName = node.getFirstAncestorByKind(
        SyntaxKind.QualifiedName,
      );
      if (qualifiedName?.getText().endsWith(`.${name}`)) {
        const typeRef = qualifiedName.getFirstAncestorByKind(
          SyntaxKind.TypeReference,
        );
        const zodPrefix = node.getText();
        if (typeRef) {
          typeRef.replaceWithText(`${zodPrefix}.${getReplacement(node)}`);
        } else {
          qualifiedName.replaceWithText(`${zodPrefix}.${importName}`);
        }
        return;
      }
    }
  });
}

// ZodType<Output, Def, Input> → ZodType<Output, Input>
function convertZodTypeGenerics(zodReferences: Node[]) {
  zodReferences.forEach((node) => {
    if (node.wasForgotten() || node.getText() !== "ZodType") {
      return;
    }

    const typeRef = node.getFirstAncestorByKind(SyntaxKind.TypeReference);
    if (!typeRef) {
      return;
    }

    const [output, _def, input] = typeRef.getTypeArguments();
    if (!output) {
      return;
    }

    const outputText = output.getText();
    const inputText = input ? input.getText() : outputText;
    typeRef.replaceWithText(`ZodType<${outputText}, ${inputText}>`);
  });
}
