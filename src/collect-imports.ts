import {
  Identifier,
  Node,
  SyntaxKind,
  type ImportDeclaration,
  type SourceFile,
} from "ts-morph";

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

export function collectZodReferences(
  sourceFile: SourceFile,
  importDeclarations: ImportDeclaration[],
) {
  const identifierMap = buildIdentifierMap(sourceFile);

  return {
    zodReferences: importDeclarations.flatMap((importDeclaration) =>
      importDeclaration.getNamedImports().flatMap((namedImport) => {
        const namedNode =
          namedImport.getAliasNode() ?? namedImport.getNameNode();
        if (!namedNode.isKind(SyntaxKind.Identifier)) {
          return [];
        }

        const name = namedNode.getText();
        const allReferences = identifierMap.get(name) ?? [];
        return allReferences.filter((node) => node !== namedNode);
      }),
    ),
    identifierMap,
  };
}

/**
 * Build a map of identifier name -> all nodes with that name.
 * This allows O(1) lookups instead of expensive findReferencesAsNodes() calls.
 */
function buildIdentifierMap(sourceFile: SourceFile): Map<string, Identifier[]> {
  const identifierMap = new Map<string, Identifier[]>();

  for (const identifier of sourceFile.getDescendantsOfKind(
    SyntaxKind.Identifier,
  )) {
    const name = identifier.getText();
    const existing = identifierMap.get(name);
    if (existing) {
      existing.push(identifier);
    } else {
      identifierMap.set(name, [identifier]);
    }
  }

  return identifierMap;
}

/**
 * Collect references to variables that are derived from Zod schemas.
 *
 * For example, given:
 *
 *     const baseSchema = z.string().refine(...);
 *     const constrainedSchema = baseSchema.refine(...);
 *
 * This function will return references to `baseSchema` (like the one used
 * in `constrainedSchema`), so we can also migrate those.
 */
export function collectDerivedZodSchemaReferences(
  zodReferences: Node[],
  identifierMap: Map<string, Identifier[]>,
): Identifier[] {
  const derivedReferences: Identifier[] = [];
  const visited = new Set<string>();

  function collectFromReferences(refs: Node[]) {
    for (const ref of refs) {
      // Find the variable declaration that contains this Zod reference
      const variableDeclaration = ref.getFirstAncestorByKind(
        SyntaxKind.VariableDeclaration,
      );
      if (!variableDeclaration) {
        continue;
      }

      const variableName = variableDeclaration.getName();
      if (visited.has(variableName)) {
        continue;
      }
      visited.add(variableName);

      // Get the identifier node for the variable name
      const nameNode = variableDeclaration.getNameNode();
      if (!nameNode.isKind(SyntaxKind.Identifier)) {
        continue;
      }

      // Find all references to this variable
      const allReferences = identifierMap.get(variableName) ?? [];
      const variableReferences = allReferences.filter(
        (node) => node !== nameNode,
      );

      derivedReferences.push(...variableReferences);

      // Recursively collect references from these derived schemas
      collectFromReferences(variableReferences);
    }
  }

  collectFromReferences(zodReferences);
  return derivedReferences;
}
