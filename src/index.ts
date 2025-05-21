import { type SourceFile, SyntaxKind } from "ts-morph";

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  collectZodReferences(sourceFile).map((node) => {
    const parentStatement =
      node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement) ??
      node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);

    parentStatement
      ?.getDescendantsOfKind(SyntaxKind.Identifier)
      .filter(
        (id) =>
          id.getParentIfKind(SyntaxKind.PropertyAssignment) &&
          id.getParent()?.getParentIfKind(SyntaxKind.ObjectLiteralExpression) &&
          id.getText() === "message",
      )
      .forEach((id) => {
        id.replaceWithText("error");
      });
  });

  return sourceFile.getFullText();
}

function collectZodReferences(sourceFile: SourceFile) {
  return sourceFile.getImportDeclarations().flatMap((importDeclaration) => {
    const isZodImport = ["zod", "zod/v4"].includes(
      importDeclaration.getModuleSpecifierValue(),
    );
    if (!isZodImport) {
      return [];
    }

    return importDeclaration.getNamedImports().flatMap((namedImport) => {
      const namedNode = namedImport.getNameNode();
      if (!namedNode.isKind(SyntaxKind.Identifier)) {
        return [];
      }

      return namedNode
        .findReferencesAsNodes()
        .filter((node) => node !== namedNode);
    });
  });
}
