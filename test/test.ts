import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { handleSourceFile } from "../src/index.js";

describe("Zod v3 to v4", () => {
  // https://zod.dev/v4/changelog?id=error-customization
  describe("Error customization", () => {
    it("replaces deprecated `message` key with `error`", async () => {
      await runScenario("error-customization.deprecate-message");
    });

    it.todo("drops `invalid_type_error` and `required_error`", async () => {
      await runScenario("error-customization.drop-outdated-error-keys");
    });

    it.todo("drops `errorMap`", async () => {
      await runScenario("error-customization.drop-error-map");
    });
  });

  // https://zod.dev/v4/changelog?id=zoderror
  describe("ZodError", () => {
    it.todo("replaces deprecated `.format()` with `z.treeifyError()`");

    it.todo("replaces deprecated `.flatten()` with `z.treeifyError()`");

    it.todo("drops `.formErrors()`");

    it.todo(
      "replaces deprecated `.addIssue()` and `.addIssues()` with direct pushes to `.issues`",
    );
  });

  // https://zod.dev/v4/changelog?id=znumber
  describe("z.number()", () => {
    it.todo("replaces deprecated `z.number().safe()` with `z.int()`");

    it.todo("replaces `z.number().int()` with `z.int()`");
  });

  // https://zod.dev/v4/changelog?id=zstring
  describe("z.string()", () => {
    it.todo("replaces deprecated `z.string().*()` with top-level APIs");

    it.todo(
      "replaces dropped `z.string().ip()` with `z.union([z.ipv4(), z.ipv6()])`",
    );

    it.todo(
      "replaces dropped `z.string().cidr()` with `z.union([z.cidrv4(), z.cidrv6()])`",
    );
  });

  // https://zod.dev/v4/changelog?id=default-updates
  describe("z.default()", () => {
    it.todo("replaces `z.default()` with `z.prefault()` to preserve behavior");
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
});

async function runScenario(fixturePath: string) {
  const { input, output } = await readFixtures(fixturePath);

  const { actual, expected } = transform(input, output);

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
