#!/usr/bin/env node

import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  progress,
  text,
} from "@clack/prompts";
import { exec } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { Project } from "ts-morph";
import { z } from "zod";
import { discoverAstroFiles, migrateAstroFile } from "./astro-migration.ts";
import { migrateZodV3ToV4 } from "./migrate.ts";
import { discoverVueFiles, migrateVueFile } from "./vue-migration.ts";

const execAsync = promisify(exec);

intro(`🏗️  Let's migrate Zod from v3 to v4`);

// Check if an argument was provided after calling the script
// Ex: npx zod-v3-to-v4 path/to/your/tsconfig.json
const args = process.argv.slice(2);
const tsConfigFilePathParam = args[0];
if (tsConfigFilePathParam) {
  const isValid = validateTsConfigPath(tsConfigFilePathParam);
  if (isValid.success) {
    // If everything is valid, run the migration without question
    await runMigration(tsConfigFilePathParam);
    process.exit(0);
  }

  log.warn(
    `"${tsConfigFilePathParam}" is not a valid tsconfig file. ${isValid.reason}

Let's do it interactively!`,
  );
}

// Check if the git working directory is clean
const { stdout } = await execAsync("git status --porcelain");
const isGitDirty = stdout.trim().length > 0;
if (isGitDirty) {
  const shouldContinue = await confirm({
    message: "Your git working directory is dirty. Continue?",
  });
  if (!shouldContinue || isCancel(shouldContinue)) {
    cancel("Migration cancelled.");
    process.exit(0);
  }
}

// Ask the user for the tsconfig file path
const tsConfigFilePath = await text({
  message: "Where is your tsconfig.json?",
  placeholder: `path/to/your/tsconfig.json`,
  initialValue: tsConfigFilePathParam ?? "tsconfig.json",
  validate(value) {
    if (!value) {
      return "Please enter a file path";
    }

    const isValid = validateTsConfigPath(value);
    if (!isValid.success) {
      return isValid.reason;
    }
  },
});
if (isCancel(tsConfigFilePath)) {
  cancel("Migration cancelled.");
  process.exit(0);
}

await runMigration(tsConfigFilePath);

async function runMigration(tsConfigFilePath: string) {
  const project = new Project({ tsConfigFilePath });
  let filesToProcess = project.getSourceFiles();
  const references = getProjectReferences(tsConfigFilePath);

  // If we can only find refs, we are probably in a monorepo setup.
  // Ask the user if they want to migrate all the references.
  const isMonorepoRoot = filesToProcess.length === 0 && references.length > 0;
  if (isMonorepoRoot) {
    const shouldFollowRefs = await confirm({
      message: `Found ${references.length} project reference(s). Migrate all referenced packages?`,
    });

    if (isCancel(shouldFollowRefs)) {
      cancel("Migration cancelled.");
      process.exit(0);
    }

    if (shouldFollowRefs) {
      for (const refPath of references) {
        project.addSourceFilesFromTsConfig(refPath);
      }
      filesToProcess = project.getSourceFiles();
    }
  }

  // Discover Vue and Astro files from the tsconfig directory
  const tsConfigDir = path.dirname(path.resolve(tsConfigFilePath));
  const vueFiles = discoverVueFiles(tsConfigDir);
  const astroFiles = discoverAstroFiles(tsConfigDir);

  const totalFiles =
    filesToProcess.length + vueFiles.length + astroFiles.length;
  let processedFilesCount = 0;
  const progressBar = progress({ max: totalFiles });
  progressBar.start("Processing files...");

  for (const sourceFile of filesToProcess) {
    try {
      migrateZodV3ToV4(sourceFile);
    } catch (err) {
      let message = `Failed to migrate ${sourceFile.getFilePath()}`;
      if (err instanceof Error) {
        message += `\nReason: ${err.message}`;
      }
      message += `\n\nPlease report this at https://github.com/nicoespeon/zod-v3-to-v4/issues`;
      log.error(message);
    }

    processedFilesCount++;
    progressBar.advance(
      1,
      `Migrated ${processedFilesCount}/${totalFiles} files`,
    );

    // Wait the next tick to let the progress bar update
    await wait(0);
  }

  // Process Vue files
  for (const vuePath of vueFiles) {
    try {
      const result = migrateVueFile(vuePath, project);
      if (result.transformed) {
        fs.writeFileSync(vuePath, result.content, "utf-8");
      }
    } catch (err) {
      let message = `Failed to migrate Vue file ${vuePath}`;
      if (err instanceof Error) {
        message += `\nReason: ${err.message}`;
      }
      message += `\n\nPlease report this at https://github.com/nicoespeon/zod-v3-to-v4/issues`;
      log.error(message);
    }

    processedFilesCount++;
    progressBar.advance(
      1,
      `Migrated ${processedFilesCount}/${totalFiles} files`,
    );

    // Wait the next tick to let the progress bar update
    await wait(0);
  }

  // Process Astro files
  for (const astroPath of astroFiles) {
    try {
      const result = migrateAstroFile(astroPath, project);
      if (result.transformed) {
        fs.writeFileSync(astroPath, result.content, "utf-8");
      }
    } catch (err) {
      let message = `Failed to migrate Astro file ${astroPath}`;
      if (err instanceof Error) {
        message += `\nReason: ${err.message}`;
      }
      message += `\n\nPlease report this at https://github.com/nicoespeon/zod-v3-to-v4/issues`;
      log.error(message);
    }

    processedFilesCount++;
    progressBar.advance(
      1,
      `Migrated ${processedFilesCount}/${totalFiles} files`,
    );

    // Wait the next tick to let the progress bar update
    await wait(0);
  }

  // Only save at the end so we can cancel the migration in-flight.
  // Also, it's much faster than saving each file individually.
  await project.save();

  progressBar.stop("All files have been migrated.");
  outro(
    `You're all set!

ℹ️  If the migration missed something or did something wrong, please report it at https://github.com/nicoespeon/zod-v3-to-v4/issues`,
  );
}

function getProjectReferences(tsConfigFilePath: string): string[] {
  // Use Zod to parse the tsconfig.json file for interesting fields.
  const tsConfigWithRefs = z
    .object({
      references: z
        .array(
          z.object({
            path: z.string().nullable(),
          }),
        )
        .default([]),
    })
    .passthrough();

  try {
    const content = fs.readFileSync(tsConfigFilePath, "utf-8");
    const config = tsConfigWithRefs.parse(JSON.parse(content));

    const tsConfigDir = path.dirname(tsConfigFilePath);

    return config.references
      .map((ref) => {
        if (!ref.path) {
          return null;
        }

        const refDir = path.resolve(tsConfigDir, ref.path);

        // Scenario: `ref.path` points directly to the tsconfig file
        if (ref.path.endsWith(".json") && fs.existsSync(refDir)) {
          return refDir;
        }

        // Otherwise, look for `tsconfig.json` in the referenced directory.
        // We don't support other names yet. Workaround is to reference
        // the tsconfig path or directly run the codemod with the path
        // to the tsconfig you want to migrate.
        const refTsConfig = path.join(refDir, "tsconfig.json");
        if (fs.existsSync(refTsConfig)) {
          return refTsConfig;
        }

        return null;
      })
      .filter((p: string | null): p is string => p !== null);
  } catch (error) {
    return [];
  }
}

function validateTsConfigPath(path: string) {
  if (!path.endsWith(".json")) {
    return {
      success: false,
      reason: "Please enter a valid tsconfig.json file path.",
    } as const;
  }

  if (!fs.existsSync(path)) {
    return {
      success: false,
      reason: "File not found.",
    } as const;
  }

  return { success: true } as const;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
