import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import * as prettier from "prettier";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { handleSourceFile } from "../src/index.js";

describe("Zod v3 to v4", () => {
  // https://zod.dev/v4/changelog?id=error-customization
  describe("Error customization", () => {
    it("replaces deprecated `message` key with `error`", async () => {
      await runScenario("error-customization.deprecate-message");
    });

    it("replaces `invalid_type_error` and `required_error` with `error` function", async () => {
      await runScenario("error-customization.drop-outdated-error-keys");
    });

    it("replaces `errorMap` with `error` function", async () => {
      await runScenario("error-customization.drop-error-map");
    });
  });

  // https://zod.dev/v4/changelog?id=zoderror
  describe("ZodError", () => {
    it("replaces deprecated `.format()`, `.flatten()`, and `.formErrors` with `z.treeifyError()`", async () => {
      await runScenario("zod-error.use-treeify-error");
    });

    it("replaces deprecated `.addIssue()` and `.addIssues()` with direct pushes to `.issues`", async () => {
      await runScenario("zod-error.push-to-issues");
    });
  });

  // https://zod.dev/v4/changelog?id=znumber
  describe("z.number()", () => {
    it("replaces deprecated `z.number().safe()` and `z.number().int() with `z.int()`", async () => {
      await runScenario("z-number");
    });
  });

  // https://zod.dev/v4/changelog?id=zstring
  describe("z.string()", () => {
    it("replaces deprecated `z.string().*()` with top-level APIs", async () => {
      await runScenario("z-string");
    });

    it("replaces dropped `z.string().ip()` with `z.union([z.ipv4(), z.ipv6()])`", async () => {
      await runScenario("z-string.convert-ip");
    });

    it("replaces dropped `z.string().cidr()` with `z.union([z.cidrv4(), z.cidrv6()])`", async () => {
      await runScenario("z-string.convert-cidr");
    });
  });

  // https://zod.dev/v4/changelog?id=default-updates
  describe("z.default()", () => {
    it("replaces `z.default()` with `z.prefault()` to preserve behavior", async () => {
      await runScenario("z-default");
    });
  });

  // https://zod.dev/v4/changelog?id=zobject
  describe("z.object()", () => {
    it.todo(
      "replaces deprecated `z.object().strict()` with `z.strictObject()`",
    );

    it.todo(
      "replaces deprecated `z.object().passthrough()` with `z.looseObject()`",
    );

    it.todo("replaces deprecated `z.strip()` with `z.object()`");

    it.todo("replaces dropped `z.nonstrict()` with `z.object()`");
  });

  // https://zod.dev/v4/changelog?id=znativeenum-deprecated
  describe("z.nativeEnum()", () => {
    it.todo("replaces deprecated `z.nativeEnum()` with `z.enum()`");
  });

  // https://zod.dev/v4/changelog?id=zarray
  describe("z.array()", () => {
    it.todo("replaces `z.nonEmpty()` with `z.tuple()` to preserve behavior");
  });

  // https://zod.dev/v4/changelog?id=zpromise-deprecated
  describe("z.promise()", () => {
    it.todo("replaces `z.promise()` with an await call before parsing");

    it.todo("replaces `z.function().promise()` with `z.implementAsync()`");
  });

  // https://zod.dev/v4/changelog?id=zfunction
  describe("z.function()", () => {
    it.todo(
      "replaces `z.args()` and `z.returns()` with `z.function()` parameters",
    );
  });

  // https://zod.dev/v4/changelog?id=zrecord
  describe("z.record()", () => {
    it.todo(
      "replaces dropped single-argument `z.record()` with a double-arguments version",
    );
  });

  // Not documented, but seems to be gone from the types in v4
  it.todo("drops `description` in creation params");

  it.todo("combines all migrations together");

  it("handles import aliases", async () => {
    await runScenario("import-aliases");
  });
});

async function runScenario(fixturePath: string) {
  const { input, output } = await readFixtures(fixturePath);

  const { actual, expected } = await transform(input, output);

  expect(actual).toEqual(expected);
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

async function transform(
  beforeText: string,
  afterText: string,
  path = "index.tsx",
) {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const actualSourceFile = project.createSourceFile(path, beforeText);
  let actual = handleSourceFile(actualSourceFile) ?? "";

  let expected = project
    .createSourceFile(`expected${extname(path)}`, afterText)
    .getFullText();

  // Format both code the same way so we don't have false positives
  try {
    actual = await prettier.format(actual, { parser: "typescript" });
  } catch {
    throw new Error(`Failed to format actual code:\n\n${actual}`);
  }

  try {
    expected = await prettier.format(expected, { parser: "typescript" });
  } catch {
    throw new Error(`Failed to format expected code:\n\n${expected}`);
  }

  return {
    actual,
    expected,
  };
}
