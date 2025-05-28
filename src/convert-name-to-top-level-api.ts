import {
  CallExpression,
  ExpressionStatement,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";

export function convertZNumberPatternsToZInt(
  node: ExpressionStatement | VariableDeclaration | undefined,
  zodName: string,
) {
  convertNameToTopLevelApi(node, {
    zodName,
    oldName: "number",
    renames: [{ name: "int" }, { name: "safe", newName: "int" }],
  });
}

export function convertZStringPatternsToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
  zodName: string,
) {
  convertNameToTopLevelApi(node, {
    zodName,
    oldName: "string",
    renames: [
      { name: "email" },
      { name: "uuid" },
      { name: "url" },
      { name: "emoji" },
      { name: "base64" },
      { name: "base64url" },
      { name: "nanoid" },
      { name: "cuid" },
      { name: "cuid2" },
      { name: "ulid" },
    ],
  });
}

function convertNameToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
  {
    zodName,
    oldName,
    renames,
  }: {
    zodName: string;
    oldName: string;
    renames: { name: string; newName?: string }[];
  },
) {
  const names = renames.map(({ name }) => name);

  node
    ?.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((e) => e.getName() === oldName)
    // Get the full call chain
    .map((expression) =>
      expression.getParentWhile(
        (parent) =>
          parent.isKind(SyntaxKind.PropertyAccessExpression) ||
          parent.isKind(SyntaxKind.CallExpression),
      ),
    )
    .filter((e): e is CallExpression => !!e?.isKind(SyntaxKind.CallExpression))
    // Only keep the ones with rename candidates inside
    .filter((expression) =>
      expression
        .getDescendants()
        .some(
          (child) =>
            child.isKind(SyntaxKind.PropertyAccessExpression) &&
            names.includes(child.getName()),
        ),
    )
    .forEach((expression) => {
      const name = expression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .find((expression) => names.includes(expression.getName()))
        ?.getName();
      const match = renames.find((r) => r.name === name);
      const newName = match?.newName ?? match?.name;

      // Remove deprecated types from the chain
      expression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((expression) => names.includes(expression.getName()))
        .forEach((expression) => {
          const parent = expression.getFirstAncestorByKind(
            SyntaxKind.CallExpression,
          );
          parent?.replaceWithText(expression.getExpression().getText());
        });

      // Replace old name with top-level API
      expression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((e) => e.getName() === oldName)
        .forEach((e) => {
          e.replaceWithText(`${zodName}.${newName}`);
        });
    });
}
