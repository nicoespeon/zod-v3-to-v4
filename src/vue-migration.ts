import * as fs from "node:fs";
import { globSync } from "tinyglobby";
import type { Project } from "ts-morph";
import { migrateZodV3ToV4 } from "./migrate.ts";
import {
  parseVueSFC,
  reconstructVueSFC,
  type VueScriptBlock,
} from "./vue-sfc.ts";

interface MigrationOptions {
  migrateImportDeclarations?: boolean;
}

interface MigrationResult {
  transformed: boolean;
  content: string;
}

export function discoverVueFiles(
  baseDir: string,
  excludePatterns: string[] = ["**/node_modules/**", "**/dist/**"],
): string[] {
  return globSync("**/*.vue", {
    cwd: baseDir,
    absolute: true,
    ignore: excludePatterns,
  });
}

export function migrateVueFile(
  filePath: string,
  project: Project,
  options: MigrationOptions = {},
): MigrationResult {
  const source = fs.readFileSync(filePath, "utf-8");
  return migrateVueSource(source, filePath, project, options);
}

export function migrateVueSource(
  source: string,
  filename: string,
  project: Project,
  options: MigrationOptions = {},
): MigrationResult {
  const parsed = parseVueSFC(source, filename);

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

  const reconstructed = reconstructVueSFC(
    source,
    parsed.scriptBlocks,
    transformedContents,
  );

  return { transformed: true, content: reconstructed };
}

function migrateScriptBlock(
  block: VueScriptBlock,
  filename: string,
  project: Project,
  options: MigrationOptions,
): string {
  const ext = getExtensionForLang(block.lang);
  const virtualPath = `${filename}__script${block.isSetup ? "_setup" : ""}${ext}`;

  const sourceFile = project.createSourceFile(virtualPath, block.content, {
    overwrite: true,
  });

  const migrated = migrateZodV3ToV4(sourceFile, options);
  project.removeSourceFile(sourceFile);

  return migrated ?? block.content;
}

function getExtensionForLang(lang: VueScriptBlock["lang"]): string {
  switch (lang) {
    case "ts":
      return ".ts";
    case "tsx":
      return ".tsx";
    case "jsx":
      return ".jsx";
    default:
      return ".js";
  }
}
