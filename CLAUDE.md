# CLAUDE.md

## Project

Codemod CLI that migrates Zod v3 code to v4. Uses **ts-morph** for AST-based transformations. Supports TypeScript, JavaScript, Vue SFCs, and Astro SFCs.

## Commands

- `pnpm test` — run tests (Vitest)
- `pnpm test:watch` — watch mode
- `pnpm typecheck` — type-check without emitting
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm format` — format with Prettier

## Tech Stack

- **ESM module** (`"type": "module"`)
- **ts-morph** for AST manipulation (not jscodeshift)
- **Vitest** for testing
- **pnpm 9.15.4**, Node.js 23.6.0 (see `.tool-versions`)
- **TypeScript strict mode** with `noUncheckedIndexedAccess`
- Import paths use `.ts` extensions (`rewriteRelativeImportExtensions`)

## Architecture

- `src/index.ts` — CLI entry point
- `src/migrate.ts` — orchestrator, calls all transformation functions in sequence
- `src/convert-*.ts` — one file per transformation category
- `src/zod-node.ts` — type guards and AST utilities for Zod nodes
- `src/ast.ts` — general AST traversal helpers
- `src/collect-imports.ts` — Zod import/reference discovery
- `src/vue-migration.ts`, `src/astro-migration.ts` — SFC support

### Adding a new migration

1. Create the transformation function in an existing `convert-*.ts` or a new one
2. Wire it into `migrate.ts` (the orchestrator applies transforms in sequence)
3. Add a test scenario (see below)

### Key patterns

- Exported functions go at the top of the file, helpers below
- AST nodes are iterated in **reverse** (bottom-up) to avoid stale references after mutations
- Check `node.wasForgotten()` before operating on nodes that may have been removed
- Use `getDirectDescendantsOfKind()` to skip nested arrow/function expressions
- Transformations use `.replaceWithText()` and `.remove()` — no direct property mutation

## Testing

Each migration scenario is proven with a **fixture pair**: `test/__scenarios__/{name}.input.ts` → `test/__scenarios__/{name}.output.ts`.

```ts
it("replaces deprecated `z.string().*()` with top-level APIs", async () => {
  await runScenario("z-string");
});
```

You can (should) bundle related scenarios together in the same file. For instance, the different variants of the `z.string().*()` API (`z.string().email()`, `z.string().uuid()`, etc.).

The test runner transforms the input via `migrateZodV3ToV4()`, formats both actual and expected with Prettier, then compares with `expect(actual).toEqual(expected)`.

### Important: zod v3 + v4 in tests

Zod v3 is installed in this repo **by design**. Input fixtures use `import { z } from "zod"` (v3). Output fixtures use `import { z } from "zod/v4"`. This lets us typecheck both sides to verify input/output are valid Zod v3/v4 code respectively.

We should not upgrade the Zod dependency of this package. The version installed is intended. The goal of this package is to migrate Zod v3 to v4 API.

Every new migration must have a proving test scenario.

### Test-first workflow (TDD)

Always start from the test, whether adding a new migration or fixing a bug:

1. Write the **minimal** fixture pair (input + expected output)
2. Run tests — **confirm the test fails** for the right reason before touching source code
3. Write the source code to make the test pass

When writing test fixtures, always include a sanity-check case with a similar-looking API that is **not** a Zod reference, to verify the codemod leaves non-Zod code alone.

### Naming conventions

- Scenario files: `{feature}.{detail}.input.ts` / `.output.ts`
- Vue scenarios: `.input.vue` / `.output.vue`
- Astro scenarios: `.input.astro` / `.output.astro`
- Tests are grouped with `describe()` blocks matching Zod v4 changelog sections

## Git & Releases

- **Conventional Commits** required (enforced on PR titles via CI)
- PRs title becomes the commit on `main`, there's a workflow to check they follow conventional commits
- **release-please** handles versioning, changelog, and npm publishing automatically
- Commit types: `feat:` (minor), `fix:` (patch), `feat!:` / `BREAKING CHANGE` (major)
