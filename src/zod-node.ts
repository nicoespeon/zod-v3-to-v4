import {
  CallExpression,
  ExpressionStatement,
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
