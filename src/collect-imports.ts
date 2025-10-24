import { SyntaxKind, type ImportDeclaration, type SourceFile } from "ts-morph";

export function collectZodImportDeclarations(sourceFile: SourceFile) {
  return sourceFile
    .getImportDeclarations()
    .filter((importDeclaration) =>
      ["zod", "zod/v3"].includes(importDeclaration.getModuleSpecifierValue()),
    );
}

export function getZodName(importDeclarations: ImportDeclaration[]) {
  const zodImport = importDeclarations[0]
    ?.getNamedImports()
    .find((namedImport) => namedImport.getName() === "z");
  const zodImportNode = zodImport?.getAliasNode() ?? zodImport?.getNameNode();
  return zodImportNode?.getText() ?? "z";
}

export function collectZodReferences(importDeclarations: ImportDeclaration[]) {
  return importDeclarations.flatMap((importDeclaration) =>
    importDeclaration.getNamedImports().flatMap((namedImport) => {
      const namedNode = namedImport.getAliasNode() ?? namedImport.getNameNode();
      if (!namedNode.isKind(SyntaxKind.Identifier)) {
        return [];
      }

      return namedNode
        .findReferencesAsNodes()
        .filter((node) => node !== namedNode);
    }),
  );
}
