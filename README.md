# Zod v3 to v4

[![NPM version](https://img.shields.io/npm/v/zod-v3-to-v4.svg?style=for-the-badge)](https://www.npmjs.com/package/zod-v3-to-v4)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/nicoespeon/zod-v3-to-v4/ci.yml?style=for-the-badge)](https://github.com/nicoespeon/zod-v3-to-v4/actions/workflows/ci.yml)

This is a [codemod](https://martinfowler.com/articles/codemods-api-refactoring.html) (a tool that automatically transforms code) for migrating from [Zod](https://zod.dev/) v3 to v4.

The migration guide can be found at <https://zod.dev/v4/changelog>

![zod-v3-to-v4-demo](zod-v3-to-v4-demo.gif)

## Using this codemod

> This assumes you have [Node.js](https://nodejs.org/) installed.

The first step for you is to upgrade your Zod version to v4. In doubt, check your `package.json`. Note that if you're using Zod through Astro v6, you don't need to upgrade Zod manually.

Then, you can use this codemod to automatically migrate your code from Zod v3 to v4 syntax.

### Interactive CLI

You can run it with the following command:

```bash
npx zod-v3-to-v4
```

It will ask you for the path to your `tsconfig.json` file, and then it will go through all your files and migrate Zod v3 code to v4.

### Non-interactive CLI

Alternatively, you can pass the path to your `tsconfig.json` file as an argument:

```bash
npx zod-v3-to-v4 path/to/your/tsconfig.json
```

This is useful if you ever need to run the codemod in script (e.g. in a CI pipeline).

### Installing it as a package

You can also install it as a package and run it from your project:

```bash
npm install -ED zod-v3-to-v4
```

And then run it with:

```bash
npx zod-v3-to-v4
```

### Reporting issues

If the codemod missed something or did something wrong, please [open an issue](https://github.com/nicoespeon/zod-v3-to-v4/issues).

## Contributing

This project uses [node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/). To get started, run:

```bash
pnpm install
```

To run the tests, run:

```bash
pnpm test
```

We use [ts-morph](https://ts-morph.com) to parse and transform the code.

Useful links:

- [ts-morph](https://ts-morph.com)
- [TS AST viewer](https://ts-ast-viewer.com/)
- [vitest](https://vitest.dev)
- [Zod v4 migration guide](https://zod.dev/v4/changelog)

### Playground

If you want to test the codemod from CLI, you can use the `playground` folder. It contains a `tsconfig.json` file and some sample TypeScript files with Zod v3 code. You can run the codemod on these files with:

```bash
pnpm playground
```

Or interactively:

```bash
pnpm playground:interactive
# Then enter: playground/tsconfig.json
```
