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

export function convertZArrayPatternsToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
  zodName: string,
) {
  const oldName = "array";
  const names = ["nonempty"];

  getCallExpressionsToConvert(node, {
    oldName,
    names,
  }).forEach((callExpression) => {
    // Remove deprecated names from the chain
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
        const parent = e.getParentIfKind(SyntaxKind.CallExpression);
        if (!parent) {
          return;
        }

        const arraySchemaArg = parent.getArguments()[0];
        if (!arraySchemaArg) {
          return;
        }

        const arraySchemaArgText = arraySchemaArg.getText();
        parent.removeArgument(arraySchemaArg);
        parent.addArgument(`[${arraySchemaArgText}], ${arraySchemaArgText}`);
        e.replaceWithText(`${zodName}.tuple`);
      });
  });
}

export function convertZFunctionPatternsToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  const oldName = "function";
  const names = ["args", "returns"];

  getCallExpressionsToConvert(node, {
    oldName,
    names,
  }).forEach((callExpression) => {
    let inputText: string | undefined;
    let outputText: string | undefined;

    // Remove deprecated names from the chain
    callExpression
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      // Start from the deepest, otherwise we can't get info from removed nodes
      .reverse()
      .filter((expression) => names.includes(expression.getName()))
      .forEach((expression) => {
        const parent = expression.getFirstAncestorByKind(
          SyntaxKind.CallExpression,
        );
        if (expression.getName() === "args") {
          inputText = `[${parent
            ?.getArguments()
            .map((arg) => arg.getText())
            .join(", ")}]`;
        } else if (expression.getName() === "returns") {
          outputText = parent?.getArguments()[0]?.getText();
        }
        parent?.replaceWithText(expression.getExpression().getText());
      });

    callExpression.addArgument(
      `{ input: ${inputText}, output: ${outputText} }`,
    );
  });
}

export function convertZRecordPatternsToTopLevelApi(
  node: ExpressionStatement | VariableDeclaration | undefined,
) {
  if (!node) {
    return;
  }

  node
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((e) => e.getName() === "record")
    // Get the full call chain
    .map((expression) =>
      expression.getParentWhile(
        (parent) =>
          parent.isKind(SyntaxKind.PropertyAccessExpression) ||
          parent.isKind(SyntaxKind.CallExpression),
      ),
    )
    .filter((e): e is CallExpression => !!e?.isKind(SyntaxKind.CallExpression))
    .forEach((e) => {
      // Make sure `z.record()` has at least 2 args
      const [firstArg, ...otherArgs] = e.getArguments();
      if (firstArg && otherArgs.length === 0) {
        e.addArgument(firstArg.getText());
      }
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

  const callExpressions = getCallExpressionsToConvert(node, { oldName, names });
  if (callExpressions.length > 1) {
    // If we have more than one node to transform, start from the most nested
    // to avoid issue described here: https://github.com/dsherret/ts-morph/issues/512
    callExpressions.reverse();
  }

  callExpressions.forEach((callExpression) => {
    const name = callExpression
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .find((expression) => names.includes(expression.getName()))
      ?.getName();
    const match = renames.find((r) => r.name === name);
    const newName = match?.newName ?? match?.name;

    // Remove deprecated names from the chain
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
  });
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
      // Remove deprecated names from the chain
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
