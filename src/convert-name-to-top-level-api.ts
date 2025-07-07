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

  convertNameToTopLevelApiAndWrapInUnion(node, {
    zodName,
    oldName: "string",
    nameToWrap: "ip",
    renames: [{ name: "ipv4" }, { name: "ipv6" }],
  });

  convertNameToTopLevelApiAndWrapInUnion(node, {
    zodName,
    oldName: "string",
    nameToWrap: "cidr",
    renames: [{ name: "cidrv4" }, { name: "cidrv6" }],
  });
}

export function convertZObjectPatternsToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
  zodName: string,
) {
  convertNameToTopLevelApi(node, {
    zodName,
    oldName: "object",
    renames: [
      { name: "strict", newName: "strictObject" },
      { name: "passthrough", newName: "looseObject" },
      { name: "strip", newName: "object" },
      { name: "nonstrict", newName: "object" },
    ],
  });
}

type NodeToConvert =
  | ExpressionStatement
  | VariableDeclaration
  | CallExpression
  | undefined;

function convertNameToTopLevelApi(
  node: NodeToConvert,
  options: ConvertNameOptions,
) {
  const { zodName, oldName, renames } = options;
  const names = renames.map(({ name }) => name);

  getCallExpressionsToConvert(node, { oldName, names }).forEach(
    (callExpression) => {
      const name = callExpression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .find((expression) => names.includes(expression.getName()))
        ?.getName();
      const match = renames.find((r) => r.name === name);
      const newName = match?.newName ?? match?.name;

      // Remove deprecated types from the chain
      callExpression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((expression) => names.includes(expression.getName()))
        .forEach((expression) => {
          const parent = expression.getFirstAncestorByKind(
            SyntaxKind.CallExpression,
          );
          parent?.replaceWithText(expression.getExpression().getText());
        });

      // Replace old name with top-level API
      callExpression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((e) => e.getName() === oldName)
        .forEach((e) => {
          e.replaceWithText(`${zodName}.${newName}`);
        });
    },
  );
}

type ConvertNameOptions = {
  zodName: string;
  oldName: string;
  renames: { name: string; newName?: string }[];
};

function convertNameToTopLevelApiAndWrapInUnion(
  node: NodeToConvert,
  options: ConvertNameOptions & {
    nameToWrap: string;
  },
) {
  const { zodName, oldName, nameToWrap, renames } = options;
  const names = [nameToWrap];

  getCallExpressionsToConvert(node, { oldName: nameToWrap, names }).forEach(
    (callExpression) => {
      // Remove deprecated types from the chain
      callExpression
        .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
        .filter((expression) => names.includes(expression.getName()))
        .forEach((expression) => {
          const parent = expression.getFirstAncestorByKind(
            SyntaxKind.CallExpression,
          );
          parent?.replaceWithText(expression.getExpression().getText());
        });

      // Nest the whole expression inside a union for ipv4() & ipv6()
      const text = callExpression.getText();
      const unionText = renames
        .map(({ name }) => `${text}.${name}()`)
        .join(", ");
      callExpression?.replaceWithText(`${zodName}.union([${unionText}])`);

      convertNameToTopLevelApi(callExpression, {
        zodName,
        oldName,
        renames,
      });
    },
  );
}

function getCallExpressionsToConvert(
  node: NodeToConvert,
  { oldName, names }: { oldName: string; names: string[] },
) {
  if (!node) {
    return [];
  }

  return (
    node
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .filter((e) => e.getName() === oldName)
      // Get the full call chain
      .map((expression) =>
        expression.getParentWhile(
          (parent) =>
            parent.isKind(SyntaxKind.PropertyAccessExpression) ||
            parent.isKind(SyntaxKind.CallExpression),
        ),
      )
      .filter(
        (e): e is CallExpression => !!e?.isKind(SyntaxKind.CallExpression),
      )
      // Only keep the ones with rename candidates inside
      .filter((callExpression) =>
        callExpression
          .getDescendants()
          .some(
            (child) =>
              child.isKind(SyntaxKind.PropertyAccessExpression) &&
              names.includes(child.getName()),
          ),
      )
  );
}
