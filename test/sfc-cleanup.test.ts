import { Project } from "ts-morph";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/migrate.ts", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/migrate.ts")>();
  return {
    ...original,
    migrateZodV3ToV4: vi.fn(original.migrateZodV3ToV4),
  };
});

import { migrateAstroSource } from "../src/astro-migration.ts";
import { migrateZodV3ToV4 } from "../src/migrate.ts";
import { migrateVueSource } from "../src/vue-migration.ts";

const mockedMigrate = vi.mocked(migrateZodV3ToV4);

describe("SFC migration cleans up virtual source files on error", () => {
  afterEach(() => {
    mockedMigrate.mockRestore();
  });

  it("removes Astro virtual source files from the project when migration throws", () => {
    mockedMigrate.mockImplementation(() => {
      throw new Error("simulated migration error");
    });

    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    const astroContent = `---
import { z } from "zod";
const schema = z.string();
---
<div>Hello</div>`;

    expect(() => {
      migrateAstroSource(astroContent, "test.astro", project);
    }).toThrow("simulated migration error");

    expect(project.getSourceFiles()).toHaveLength(0);
  });

  it("removes Vue virtual source files from the project when migration throws", () => {
    mockedMigrate.mockImplementation(() => {
      throw new Error("simulated migration error");
    });

    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
    });

    const vueContent = `<script lang="ts">
import { z } from "zod";
const schema = z.string();
</script>
<template><div>Hello</div></template>`;

    expect(() => {
      migrateVueSource(vueContent, "test.vue", project);
    }).toThrow("simulated migration error");

    expect(project.getSourceFiles()).toHaveLength(0);
  });
});
