import { Node, ReturnStatement, SyntaxKind } from "ts-morph";
import { type ZodNode } from "./zod-node.ts";

export function stripSuperRefineReturnValues(node: ZodNode) {
  const callExpressions = node.isKind(SyntaxKind.CallExpression)
    ? [node, ...node.getDescendantsOfKind(SyntaxKind.CallExpression)]
    : node.getDescendantsOfKind(SyntaxKind.CallExpression);

  callExpressions
    .filter((call) => {
      const expression = call.getExpression();
      if (!expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        return false;
      }
      return expression.getName() === "superRefine";
    })
    .forEach((superRefineCall) => {
      const callback = superRefineCall.getArguments()[0];
      if (!callback) {
        return;
      }

      const callbackBody =
        callback.isKind(SyntaxKind.ArrowFunction) ||
        callback.isKind(SyntaxKind.FunctionExpression)
          ? callback.getBody()
          : undefined;

      if (!callbackBody) {
        return;
      }

      getDirectReturnStatements(callbackBody).forEach((returnStatement) => {
        const expression = returnStatement.getExpression();
        if (!expression) {
          return;
        }

        const isUndefinedLiteral =
          expression.isKind(SyntaxKind.Identifier) &&
          expression.getText() === "undefined";

        if (!isUndefinedLiteral) {
          returnStatement.replaceWithText("return;");
        }
      });
    });
}

/**
 * Get return statements that are direct children of the given node,
 * excluding those nested within inner functions.
 */
function getDirectReturnStatements(node: Node): ReturnStatement[] {
  const returns: ReturnStatement[] = [];

  for (const child of node.getChildren()) {
    if (child.isKind(SyntaxKind.ReturnStatement)) {
      returns.push(child);
    } else if (
      !child.isKind(SyntaxKind.ArrowFunction) &&
      !child.isKind(SyntaxKind.FunctionExpression) &&
      !child.isKind(SyntaxKind.FunctionDeclaration)
    ) {
      returns.push(...getDirectReturnStatements(child));
    }
  }

  return returns;
}
