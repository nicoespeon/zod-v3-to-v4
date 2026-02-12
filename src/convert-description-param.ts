import { ObjectLiteralExpression, SyntaxKind } from "ts-morph";
import { getDirectDescendantsOfKind, type ZodNode } from "./zod-node.ts";

export function convertDescriptionParamToDescribeCall(node: ZodNode) {
  getDirectDescendantsOfKind(node, SyntaxKind.Identifier)
    .filter(
      (id) =>
        id.getText() === "description" &&
        (id.getParentIfKind(SyntaxKind.PropertyAssignment) !== undefined ||
          id.getParentIfKind(SyntaxKind.ShorthandPropertyAssignment) !==
            undefined),
    )
    .map((id) =>
      id.getParent()?.getParentIfKind(SyntaxKind.ObjectLiteralExpression),
    )
    .filter(
      (objectLiteral): objectLiteral is ObjectLiteralExpression =>
        objectLiteral !== undefined,
    )
    .forEach((objectLiteral) => {
      const callExpression = objectLiteral.getParentIfKind(
        SyntaxKind.CallExpression,
      );
      if (!callExpression) {
        return;
      }

      const descriptionProp = objectLiteral.getProperty("description");
      if (!descriptionProp) {
        return;
      }

      let descriptionValue: string;
      if (descriptionProp.isKind(SyntaxKind.ShorthandPropertyAssignment)) {
        descriptionValue = descriptionProp.getName();
      } else if (descriptionProp.isKind(SyntaxKind.PropertyAssignment)) {
        const initializer = descriptionProp.getInitializer();
        if (!initializer) {
          return;
        }

        // Skip if value is a Zod expression (e.g., z.object({description: z.string()}))
        if (
          initializer.isKind(SyntaxKind.CallExpression) ||
          initializer.isKind(SyntaxKind.PropertyAccessExpression)
        ) {
          return;
        }

        descriptionValue = initializer.getText();
      } else {
        return;
      }

      descriptionProp.remove();

      // If only `{}` is left, remove it
      if (objectLiteral.getProperties().length === 0) {
        callExpression.removeArgument(objectLiteral);
      }

      callExpression.replaceWithText(
        `${callExpression.getText()}.describe(${descriptionValue})`,
      );
    });
}
