import {
  CallExpression,
  ExpressionStatement,
  KindToNodeMappings,
  Node,
  PropertyAccessExpression,
  SyntaxKind,
} from "ts-morph";

export type ZodNode =
  | CallExpression
  | PropertyAccessExpression
  | ExpressionStatement;

export function isZodNode(node: Node): node is ZodNode {
  return (
    node.isKind(SyntaxKind.CallExpression) ||
    node.isKind(SyntaxKind.PropertyAccessExpression) ||
    node.isKind(SyntaxKind.ExpressionStatement)
  );
}

/**
 * Return all direct descendants of a given kind.
 *
 * It filters out descendants nested within a new function expression.
 */
export function getDirectDescendantsOfKind<T extends SyntaxKind>(
  node: Node,
  kind: T,
): KindToNodeMappings[T][] {
  return node
    .getChildren()
    .filter(
      (child) =>
        !child.isKind(SyntaxKind.ArrowFunction) &&
        !child.isKind(SyntaxKind.FunctionExpression),
    )
    .flatMap((child) => {
      if (child.isKind(kind)) {
        return child;
      }

      return getDirectDescendantsOfKind(child, kind);
    });
}
