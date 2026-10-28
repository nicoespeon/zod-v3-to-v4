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
  const visited = new Set<Node>();

  function collectFromReferences(refs: Node[]) {
    for (const ref of refs) {
      // Find the variable declaration initialized from this Zod reference
      const variableDeclaration = getChainedExpression(ref).getParentIfKind(
        SyntaxKind.VariableDeclaration,
      );
      if (!variableDeclaration) {
        continue;
      }

      if (visited.has(variableDeclaration)) {
        continue;
      }
      visited.add(variableDeclaration);

      // Get the identifier node for the variable name
      const nameNode = variableDeclaration.getNameNode();
      if (!nameNode.isKind(SyntaxKind.Identifier)) {
        continue;
      }

      // Find all references to this variable
      const allReferences = identifierMap.get(nameNode.getText()) ?? [];
      const variableSymbol = nameNode.getSymbol();
      const variableReferences = allReferences.filter(
        (node) => node !== nameNode && node.getSymbol() === variableSymbol,
      );

      derivedReferences.push(...variableReferences);

      // Recursively collect references from these derived schemas
      collectFromReferences(variableReferences);
    }
  }

  collectFromReferences(zodReferences);
  return derivedReferences;
}

// `schema.min(1)` is chained from `schema`, `useForm(schema)` is not
function getChainedExpression(node: Node): Node {
  const parent = node.getParent();
  const isChainedFromNode =
    (Node.isPropertyAccessExpression(parent) ||
      Node.isCallExpression(parent)) &&
    parent.getExpression() === node;
  return isChainedFromNode ? getChainedExpression(parent) : node;
}
