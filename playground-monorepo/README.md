# Playground (Monorepo)

This folder simulates a monorepo structure with TypeScript project references to test the migration CLI's ability to handle monorepo setups.

## Structure

```
playground-monorepo/
├── tsconfig.json          # Root tsconfig with project references (no source files)
├── packages/
│   ├── app/
│   │   ├── tsconfig.json  # App package config (references shared)
│   │   └── src/
│   │       └── api.ts     # Zod v3 schemas
│   └── shared/
│       ├── tsconfig.json  # Shared package config
│       └── src/
│           └── schemas.ts # Zod v3 schemas
```

## Usage

To test the migration script on this monorepo:

```bash
pnpm playground:monorepo
```

Or interactively:

```bash
pnpm playground:interactive
# Then enter: playground-monorepo/tsconfig.json
```

## Resetting

To reset the playground files to their original state (before migration):

```bash
git checkout -- playground-monorepo/
```
