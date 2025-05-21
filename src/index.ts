import {
  ExpressionStatement,
  ImportDeclaration,
  type SourceFile,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  const importDeclarations = collectZodImportDeclarations(sourceFile);

  importDeclarations.forEach((importDeclaration) => {
    importDeclaration.setModuleSpecifier("zod/v4");
  });

  collectZodReferences(importDeclarations).forEach((node) => {
    const parentStatement =
      node.getFirstAncestorByKind(SyntaxKind.ExpressionStatement) ??
      node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);

    convertMessageKeyToError(parentStatement);
  });

  return sourceFile.getFullText();
}

function convertMessageKeyToError(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  node
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
