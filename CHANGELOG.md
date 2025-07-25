# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Support for `z.string().date()`, `z.string().time()`, `z.string().datetime()`, and `z.string().duration()` to `z.iso.*()` ([#4](https://github.com/nicoespeon/zod-v3-to-v4/pull/4))
- Passing an enum as the first argument of a `z.record()` will now be migrated to `z.partialRecord()` [to preserve the partial type](https://zod.dev/v4/changelog?id=improves-enum-support).

### Fixed

- Fixed some scenarios where nested `z.object()` would produced an invalid `z.undefined()`.
- Sometimes, the codemod would try to migrate unrelated `message` keys to an `error` one, producing invalid code while doing so. This should be fixed now.
- `z.record()` is now correctly migrated when using a custom key type (e.g. `z.record(Device)` => `z.record(z.string(), Device)`).

## [1.0.2] - 2025-07-24

### Fixed

Anything that wasn't named `tsconfig.json` was not considered a valid tsconfig ([#2](https://github.com/nicoespeon/zod-v3-to-v4/issues/2)). This has been fixed.

The CLI now works with any JSON file (such as `tsconfig.base.json`).

## [1.0.1] - 2025-07-24

### Fixed

- **Nested object transformations**: Fixed issue where nested `z.object().strict()` transformations were not handled correctly ([#1](https://github.com/nicoespeon/zod-v3-to-v4/issues/1))
- **Error handling**: Added proper error handling to prevent crashes when migration fails on individual files
- **Developer experience**: Improved error messages with file paths and links to issue reporting

## [1.0.0] - 2025-07-23

**Initial release** of the Zod v3 to v4 migration codemod

### Added

- **Interactive CLI** that prompts for `tsconfig.json` path and automatically migrates all TypeScript files
- **Non-interactive CLI** support for scripted usage (e.g., CI pipelines)
- **Comprehensive migration support** for all major Zod v3 to v4 breaking changes:

#### Import Migration

- Automatically updates import statements from `"zod"` to `"zod/v4"`
- Preserves import aliases and named imports

#### Error Customization Migration

- Converts deprecated `message` key to `error` function
- Replaces `invalid_type_error` and `required_error` with unified `error` function
- Migrates `errorMap` to `error` function syntax
- Updates ZodError handling: `error.format()` and `error.flatten()` → `z.treeifyError(error)`
- Converts `error.formErrors` → `z.treeifyError(error)`
- Migrates `error.addIssue()` to direct `error.issues.push()` calls
- Updates ZodIssue structure: adds required `input` property and renames `type` to `origin`

#### Schema API Migration

- **String schemas**: Migrates validation methods to top-level API

  - `z.string().email()` → `z.email()`
  - `z.string().uuid()` → `z.uuid()`
  - `z.string().url()` → `z.url()`
  - `z.string().emoji()` → `z.emoji()`
  - `z.string().base64()` → `z.base64()`
  - `z.string().base64url()` → `z.base64url()`
  - `z.string().nanoid()` → `z.nanoid()`
  - `z.string().cuid()` → `z.cuid()`
  - `z.string().cuid2()` → `z.cuid2()`
  - `z.string().ulid()` → `z.ulid()`
  - `z.string().ip()` → `z.union([z.ipv4(), z.ipv6()])`
  - `z.string().cidr()` → `z.union([z.cidrv4(), z.cidrv6()])`

- **Number schemas**: Migrates integer validation to top-level API

  - `z.number().int()` → `z.int()`
  - `z.number().safe()` → `z.int()`

- **Object schemas**: Migrates unknown key handling to top-level API

  - `z.object().passthrough()` → `z.passthrough()`
  - `z.object().strict()` → `z.strict()`
  - `z.object().strip()` → `z.strip()`

- **Array schemas**: Migrates non-empty arrays to top-level API

  - `z.array().nonempty()` → `z.tuple([schema], schema)`

- **Function schemas**: Migrates to new input/output syntax

  - `z.function().args().returns()` → `z.function({ input: [...], output: ... })`

- **Record schemas**: Migrates to top-level API

  - `z.record(z.string())` → `z.record(z.string(), z.string())`

- **Enum and Default schemas**: Migrates to new APIs
  - Renames `z.default()` → `z.prefault()`
  - Renames `z.nativeEnum()` → `z.enum()`
  - Updates `ZodSchema` type references → `ZodJSONSchema`

### Usage

```bash
# Interactive mode
npx zod-v3-to-v4

# Non-interactive mode
npx zod-v3-to-v4 path/to/tsconfig.json
```

---

**Note**: This codemod requires that you have already upgraded your Zod dependency to v4. The tool will automatically transform your code to use the new v4 syntax and APIs.

For more information about Zod v4 changes, see the [official migration guide](https://zod.dev/v4/changelog).

<!-- Links -->

[1.0.2]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/84de37227de3b85c13458b6637b57b7cc95a799b...1.0.0
