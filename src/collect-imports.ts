import { SyntaxKind, type ImportDeclaration, type SourceFile } from "ts-morph";

export const AstroZodModuleSpecifier = "astro/zod";

// https://v6.docs.astro.build/en/guides/upgrade-to/v6/#deprecated-astroschema-and-z-from-astrocontent
export const AstroDeprecatedZodModuleSpecifiers = [
  "astro:content",
  "astro:schema",
];

export const AstroZodModuleSpecifiers = [
  AstroZodModuleSpecifier,
  ...AstroDeprecatedZodModuleSpecifiers,
];

const zodModuleSpecifiers = ["zod", "zod/v3", ...AstroZodModuleSpecifiers];

export function collectZodImportDeclarations(sourceFile: SourceFile) {
  return sourceFile
    .getImportDeclarations()
    .filter((importDeclaration) =>
      zodModuleSpecifiers.includes(importDeclaration.getModuleSpecifierValue()),
    );
}

export function getZodName(importDeclarations: ImportDeclaration[]) {
  const zodImport = getZodImport(importDeclarations[0]);
  const zodImportNode = zodImport?.getAliasNode() ?? zodImport?.getNameNode();
  return zodImportNode?.getText() ?? "z";
}

export function getZodImport(importDeclaration?: ImportDeclaration) {
  return importDeclaration
    ?.getNamedImports()
    .find((namedImport) => namedImport.getName() === "z");
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
