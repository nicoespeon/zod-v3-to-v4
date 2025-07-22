# Playground

This folder contains sample TypeScript files with Zod v3 code that you can use to test the migration CLI script.

## Files

- `tsconfig.json` - TypeScript configuration for the playground
- `example1.ts` - Basic Zod schemas and validation
- `example2.ts` - Complex schemas with unions, transforms, and refinements
- `example3.ts` - Error handling and nested schemas

## Usage

To test the migration script on these files, run from the project root:

```bash
pnpm playground
```

Or interactively:

```bash
pnpm playground:interactive
# Then enter: playground/tsconfig.json
```

## Resetting

To reset the playground files to their original state (before migration), you can:

1. Use git to restore the files: `git checkout -- playground/`
2. Or manually copy the original content back

## Adding More Examples

Feel free to add more TypeScript files with Zod v3 code to test different migration scenarios.
