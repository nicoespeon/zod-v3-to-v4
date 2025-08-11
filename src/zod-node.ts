import {
  CallExpression,
  ExpressionStatement,
  KindToNodeMappings,
  Node,
  PropertyAccessExpression,
  SyntaxKind,
} from "ts-morph";
import { findRootQualifiedName } from "./ast.ts";

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

/**
 * Returns true if the given expression binds to `Z.X` where `Z` is zod name
 * and `X` is one of the expected types.
 *
 * @example
 * isZodReference("z", ["ZodJSONSchema", "ZodError"], expression)
 * // => true if expression is `z.ZodJSONSchema` or `z.ZodError`
 */
export function isZodReference(
  zodName: string,
  expectedTypes: string[],
  expression: CallExpression | PropertyAccessExpression,
) {
  const qualifiedName = findRootQualifiedName(expression);

  const left = qualifiedName?.getLeft();
  const belongsToZod =
    left?.isKind(SyntaxKind.Identifier) && left.getText() === zodName;

  const right = qualifiedName?.getRight();
  const isExpectedType =
    right?.isKind(SyntaxKind.Identifier) &&
    expectedTypes.includes(right.getText());

  return belongsToZod && isExpectedType;
}
