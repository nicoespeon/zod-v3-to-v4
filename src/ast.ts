import {
  CallExpression,
  Identifier,
  ImportDeclaration,
  PropertyAccessExpression,
  QualifiedName,
  SyntaxKind,
  ts,
} from "ts-morph";

export function findRootNode(
  node: CallExpression | PropertyAccessExpression | undefined,
):
  | { type: "qualified name"; value: QualifiedName }
  | { type: "import declaration"; value: ImportDeclaration }
  | { type: "not found" } {
  const identifier = findFirstIdentifier(node);
  const [mainDeclaration] = identifier?.getSymbol()?.getDeclarations() ?? [];

  if (mainDeclaration?.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = mainDeclaration.getInitializer();
    if (
      initializer?.isKind(SyntaxKind.CallExpression) ||
      initializer?.isKind(SyntaxKind.PropertyAccessExpression)
    ) {
      return findRootNode(initializer);
    }
    return { type: "not found" };
  }

  if (mainDeclaration?.isKind(SyntaxKind.Parameter)) {
    const qualifiedName = mainDeclaration
      ?.getFirstChildByKind(ts.SyntaxKind.TypeReference)
      ?.getFirstChildByKind(ts.SyntaxKind.QualifiedName);
    return qualifiedName
      ? { type: "qualified name", value: qualifiedName }
      : { type: "not found" };
  }

  if (mainDeclaration?.isKind(SyntaxKind.ImportSpecifier)) {
    const importDeclaration = mainDeclaration.getFirstAncestorByKind(
      SyntaxKind.ImportDeclaration,
    );
    return importDeclaration
      ? { type: "import declaration", value: importDeclaration }
      : { type: "not found" };
  }

  return { type: "not found" };
}

export function findRootExpression(
  node: CallExpression | PropertyAccessExpression | undefined,
): CallExpression | PropertyAccessExpression | undefined {
  const identifier = findFirstIdentifier(node);
  const [mainDeclaration] = identifier?.getSymbol()?.getDeclarations() ?? [];

  if (mainDeclaration?.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = mainDeclaration.getInitializer();
    if (
      initializer?.isKind(SyntaxKind.CallExpression) ||
      initializer?.isKind(SyntaxKind.PropertyAccessExpression)
    ) {
      return findRootExpression(initializer);
    }
    return undefined;
  }

  if (mainDeclaration?.isKind(SyntaxKind.ImportSpecifier)) {
    return node;
  }

  return undefined;
}

function findFirstIdentifier(
  node: CallExpression | PropertyAccessExpression | undefined,
): Identifier | undefined {
  const nestedExpression = node?.getExpression();

  if (nestedExpression?.isKind(SyntaxKind.PropertyAccessExpression)) {
    return findFirstIdentifier(nestedExpression);
  }

  if (nestedExpression?.isKind(SyntaxKind.Identifier)) {
    return nestedExpression;
  }

  return undefined;
}
