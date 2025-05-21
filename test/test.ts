import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { handleSourceFile } from "../src/index.js";

describe("Zod v3 to v4", () => {
  // https://zod.dev/v4/changelog?id=error-customization
  describe("Error customization", () => {
    it("replaces deprecated `message` key with `error`", async () => {
      const { input, output } = await readFixtures(
        "error-customization.deprecate-message",
      );

      const { actual, expected } = transform(input, output);

      expect(actual).toEqual(expected);
    });
  });
});

function transform(beforeText: string, afterText: string, path = "index.tsx") {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const actualSourceFile = project.createSourceFile(path, beforeText);
  const actual = handleSourceFile(actualSourceFile);

  const expected = project
    .createSourceFile(`expected${extname(path)}`, afterText)
    .getFullText();

  return {
    actual,
    expected,
  };
}

async function readFixtures(name: string) {
  const input = await readFile(
    `./test/__scenarios__/${name}.input.ts`,
    "utf-8",
  );
  const output = await readFile(
    `./test/__scenarios__/${name}.output.ts`,
    "utf-8",
  );

  return {
    input,
    output,
  };
}
