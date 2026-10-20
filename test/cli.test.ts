import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const cliPath = resolve(import.meta.dirname, "../src/index.ts");
const zodV3Source = `import { z } from "zod";\nexport const s = z.string().email();\n`;
const zodV4Source = `import { z } from "zod";\nexport const s = z.email();\n`;

describe("CLI", () => {
  const projectDirs: string[] = [];

  afterEach(() => {
    projectDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }));
    projectDirs.length = 0;
  });

  it("migrates the given tsconfig without asking", () => {
    const projectDir = createProject();
    projectDirs.push(projectDir);

    runCli(projectDir, ["tsconfig.json"]);

    expect(readSource(projectDir)).toBe(zodV4Source);
  });

  it("migrates all referenced packages of a monorepo, given -y", () => {
    const projectDir = createMonorepo();
    projectDirs.push(projectDir);

    runCli(projectDir, ["tsconfig.json", "-y"]);

    expect(readSource(projectDir, "pkg")).toBe(zodV4Source);
  });

  it("migrates the tsconfig.json of the current directory, given -y and no path", () => {
    const projectDir = createProject();
    projectDirs.push(projectDir);

    runCli(projectDir, ["-y"]);

    expect(readSource(projectDir)).toBe(zodV4Source);
  });

  it("fails with an error instead of prompting, given -y and an invalid path", () => {
    const projectDir = createProject();
    projectDirs.push(projectDir);

    const result = runCli(projectDir, ["missing/tsconfig.json", "-y"]);

    expect(result).toMatchObject({
      status: 1,
      output: expect.stringContaining(
        `"missing/tsconfig.json" is not a valid tsconfig file. File not found.`,
      ),
    });
  });

  it("fails with an error instead of prompting, given -y and no tsconfig.json in the current directory", () => {
    const projectDir = createProject();
    projectDirs.push(projectDir);
    rmSync(join(projectDir, "tsconfig.json"));

    const result = runCli(projectDir, ["-y"]);

    expect(result).toMatchObject({
      status: 1,
      output: expect.stringContaining(
        `"tsconfig.json" is not a valid tsconfig file. File not found.`,
      ),
    });
  });

  it("asks to continue on a dirty git working directory, given no path", () => {
    const projectDir = createProject();
    projectDirs.push(projectDir);

    const { output } = runCli(projectDir, []);

    expect(output).toContain("Your git working directory is dirty. Continue?");
  });
});

// Files are left untracked, so the git working directory is dirty.
function createProject() {
  const projectDir = mkdtempSync(join(tmpdir(), "zod-v3-to-v4-cli-"));
  execFileSync("git", ["init", "-q"], { cwd: projectDir });
  writeFileSync(
    join(projectDir, "tsconfig.json"),
    JSON.stringify({ include: ["*.ts"] }),
  );
  writeFileSync(join(projectDir, "schema.ts"), zodV3Source);
  return projectDir;
}

function createMonorepo() {
  const projectDir = mkdtempSync(join(tmpdir(), "zod-v3-to-v4-cli-"));
  execFileSync("git", ["init", "-q"], { cwd: projectDir });
  writeFileSync(
    join(projectDir, "tsconfig.json"),
    JSON.stringify({ files: [], references: [{ path: "./pkg" }] }),
  );
  mkdirSync(join(projectDir, "pkg"));
  writeFileSync(
    join(projectDir, "pkg", "tsconfig.json"),
    JSON.stringify({ include: ["*.ts"] }),
  );
  writeFileSync(join(projectDir, "pkg", "schema.ts"), zodV3Source);
  return projectDir;
}

function readSource(projectDir: string, packageDir = ".") {
  return readFileSync(join(projectDir, packageDir, "schema.ts"), "utf-8");
}

// No stdin, like in a CI pipeline: any prompt makes the CLI exit early.
function runCli(cwd: string, args: string[]) {
  const { status, stdout, stderr } = spawnSync("node", [cliPath, ...args], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf-8",
    timeout: 20_000,
  });
  return { status, output: stdout + stderr };
}
