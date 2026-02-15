import { glob } from "glob";
import * as fs from "node:fs";
import type { Project } from "ts-morph";
import {
  parseAstroSFC,
  reconstructAstroSFC,
  type AstroScriptBlock,
} from "./astro-sfc.ts";
import { migrateZodV3ToV4 } from "./migrate.ts";

interface MigrationOptions {
  migrateImportDeclarations?: boolean;
}

interface MigrationResult {
  transformed: boolean;
  content: string;
}

export function discoverAstroFiles(
  baseDir: string,
  excludePatterns: string[] = ["**/node_modules/**", "**/dist/**"],
): string[] {
  return glob.sync("**/*.astro", {
    cwd: baseDir,
    absolute: true,
    ignore: excludePatterns,
  });
}

export function migrateAstroFile(
  filePath: string,
  project: Project,
  options: MigrationOptions = {},
): MigrationResult {
  const source = fs.readFileSync(filePath, "utf-8");
  return migrateAstroSource(source, filePath, project, options);
}

export function migrateAstroSource(
  source: string,
  filename: string,
  project: Project,
  options: MigrationOptions = {},
): MigrationResult {
  const parsed = parseAstroSFC(source, filename);

  if (!parsed.hasZodImport) {
    return { transformed: false, content: source };
  }

  if (parsed.scriptBlocks.length === 0) {
    return { transformed: false, content: source };
  }

  const transformedContents: string[] = [];
  let hasChanges = false;

  for (const block of parsed.scriptBlocks) {
    const transformed = migrateScriptBlock(block, filename, project, options);
    transformedContents.push(transformed);

    if (transformed !== block.content) {
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return { transformed: false, content: source };
  }

  const reconstructed = reconstructAstroSFC(
    source,
    parsed.scriptBlocks,
    transformedContents,
  );

  return { transformed: true, content: reconstructed };
}

function migrateScriptBlock(
  block: AstroScriptBlock,
  filename: string,
  project: Project,
  options: MigrationOptions,
): string {
  const virtualPath = `${filename}__${block.type}.ts`;

  const sourceFile = project.createSourceFile(virtualPath, block.content, {
    overwrite: true,
  });

  const migrated = migrateZodV3ToV4(sourceFile, options);
  project.removeSourceFile(sourceFile);

  return migrated ?? block.content;
}
