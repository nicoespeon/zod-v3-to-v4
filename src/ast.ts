import {
  CallExpression,
  Identifier,
  PropertyAccessExpression,
  QualifiedName,
  SyntaxKind,
  ts,
} from "ts-morph";

export function findRootQualifiedName(
  node: CallExpression | PropertyAccessExpression | undefined,
): QualifiedName | undefined {
  const identifier = findRootIdentifier(node);
  const [mainDeclaration] = identifier?.getSymbol()?.getDeclarations() ?? [];

  if (mainDeclaration?.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = mainDeclaration.getInitializer();
    if (
      initializer?.isKind(SyntaxKind.CallExpression) ||
      initializer?.isKind(SyntaxKind.PropertyAccessExpression)
    ) {
      return findRootQualifiedName(initializer);
    }
    return undefined;
  }

  if (mainDeclaration?.isKind(SyntaxKind.Parameter)) {
    return mainDeclaration
      ?.getFirstChildByKind(ts.SyntaxKind.TypeReference)
      ?.getFirstChildByKind(ts.SyntaxKind.QualifiedName);
  }

  return undefined;
}

export function findRootNode(
  node: CallExpression | PropertyAccessExpression | undefined,
): CallExpression | PropertyAccessExpression | undefined {
  const identifier = findRootIdentifier(node);
  const [mainDeclaration] = identifier?.getSymbol()?.getDeclarations() ?? [];

  if (mainDeclaration?.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = mainDeclaration.getInitializer();
    if (
      initializer?.isKind(SyntaxKind.CallExpression) ||
      initializer?.isKind(SyntaxKind.PropertyAccessExpression)
    ) {
      return findRootNode(initializer);
    }
    return undefined;
  }

  if (mainDeclaration?.isKind(SyntaxKind.ImportSpecifier)) {
    return node;
  }

  return undefined;
}

function findRootIdentifier(
  node: CallExpression | PropertyAccessExpression | undefined,
): Identifier | undefined {
  const nestedExpression = node?.getExpression();

  if (nestedExpression?.isKind(SyntaxKind.PropertyAccessExpression)) {
    return findRootIdentifier(nestedExpression);
  }

  if (nestedExpression?.isKind(SyntaxKind.Identifier)) {
    return nestedExpression;
  }

  return undefined;
}
