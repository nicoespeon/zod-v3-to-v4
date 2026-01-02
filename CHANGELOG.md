# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Migrate deprecated `z.setErrorMap()` to `z.config({ customError })` and `z.ZodErrorMap` to `z.core.$ZodErrorMap`. ([#65](https://github.com/nicoespeon/zod-v3-to-v4/issues/65))

## [1.11.0] - 2025-12-30

### Added

- The codemod now supports classic monorepo structures with a top-level `tsconfig.json` that [has references to others](https://www.typescriptlang.org/docs/handbook/project-references.html). [#62](https://github.com/nicoespeon/zod-v3-to-v4/issues/62)
- The codemod can now migrate more indirect Zod references, such as derived schemas that were missed before. [#64](https://github.com/nicoespeon/zod-v3-to-v4/issues/64). For instance:

  ```ts
  const baseSchema = z.number().int().min(3);

  // 👇 Now, this one will be migrated too!
  const derivedSchema = baseSchema.max(10).refine((value) => value % 2 === 0, {
    message: "Value must be even",
  });
  ```

### Fixed

- Nested `z.array().nonempty()` failed to migrate. They are properly handled now. [#63](https://github.com/nicoespeon/zod-v3-to-v4/issues/63)

## [1.10.0] - 2025-12-15

### Added

- Migrate `result.error.errors` to `result.error.issues`. Thanks @matsjfunke for the suggestion ([#60](https://github.com/nicoespeon/zod-v3-to-v4/issues/60))

## [1.9.0] - 2025-12-12

### Added

- Support Astro v6 migration. They are upgrading from Zod 3 to Zod 4. The codemod will take care of updating the imports to the new `astro/zod`. Thanks [@HiDeoo](https://github.com/HiDeoo) for this one! ([#33](https://github.com/nicoespeon/zod-v3-to-v4/issues/33))

## [1.8.0] - 2025-12-11

### Added

- Migrates deleted Zod types to their v4 replacements. Thanks [@gajus](https://github.com/gajus) for reporting them:
  - `SafeParseReturnType<I, O>` → `ZodSafeParseResult<O>` (keeps only the output type) ([#30](https://github.com/nicoespeon/zod-v3-to-v4/issues/31))
  - `ZodTypeAny` → `ZodType` ([#31](https://github.com/nicoespeon/zod-v3-to-v4/issues/31))
  - `AnyZodObject` → `ZodRecord<any, any>` ([#32](https://github.com/nicoespeon/zod-v3-to-v4/issues/32))

## [1.7.1] - 2025-11-28

### Fixed

- Converts `ZodSchema` into `ZodType` instead of `ZodJSONSchema`, which was a mistake ([#28](https://github.com/nicoespeon/zod-v3-to-v4/pull/28))

## [1.7.0] - 2025-11-05

### Added

- Supports `z.string().ip/cidr({ version })` patterns to directly migrate to the appropriate method instead of the union. E.g., `z.string().ip({ version: "v4" })` => `z.ipv4()`. Thanks [@Schrubitteflau](https://github.com/Schrubitteflau) for reporting and implementing! ([#26](https://github.com/nicoespeon/zod-v3-to-v4/pull/26))

## [1.6.1] - 2025-10-27

### Fixed

- Fixed an issue where `z.string().ip()` and `z.string().cidr()` would incorrectly migrate `safeParse()` (and others) as part of the union when migrating to `z.union([z.ipv4(), z.ipv6()])` and `z.union([z.cidrv4(), z.cidrv6()])` respectively. ([#25](https://github.com/nicoespeon/zod-v3-to-v4/pull/25))

## [1.6.0] - 2025-10-06

### Added

- The codemod now migrates code that imports from `zod/v3` explicitly. It will migrate the patterns and update the import to be `zod` directly, as it assumes you have migrated the dependency to v4 already. ([#24](https://github.com/nicoespeon/zod-v3-to-v4/pull/24))

## [1.5.0] - 2025-10-06

### Added

- The codemod now resolves indirect references to Zod than before. For example, `validatedFields.error.flatten()` will now be correctly transformed into `z.treeifyError(validatedFields.error)` by following the definition of `validatedFields` up until the first Zod reference or import. ([#19](https://github.com/nicoespeon/zod-v3-to-v4/pull/19))
- Converts `z.X({ coerce: true })` to `z.coerce.X()` where `X` is one of `bigint`, `boolean`, `date`, `number`, or `string`. ([#22](https://github.com/nicoespeon/zod-v3-to-v4/pull/22))

## [1.4.0] - 2025-08-22

### Added

- Rename `schema.Enum` into `schema.enum` if `schema` comes from `z.enum()`. ([#16](https://github.com/nicoespeon/zod-v3-to-v4/pull/16))
- Migrate the deprecated `ZodIssueCode` into literal strings, as recommended. ([#8](https://github.com/nicoespeon/zod-v3-to-v4/pull/8)). Some codes where removed, so they are mapped to a valid literal strings that seems the most appropriate:

```
| ZodIssueCode (v3)           | Literal string (v4) |
| --------------------------- | ------------------- |
| custom                      | "custom"            |
| invalid_type                | "invalid_type"      |
| unrecognized_keys           | "unrecognized_keys" |
| too_big                     | "too_big"           |
| too_small                   | "too_small"         |
| not_multiple_of             | "not_multiple_of"   |
| invalid_union               | "invalid_union"     |
| invalid_literal             | "invalid_type"      |
| invalid_union_discriminator | "invalid_union"     |
| invalid_enum_value          | "invalid_type"      |
| invalid_arguments           | "invalid_type"      |
| invalid_return_type         | "invalid_type"      |
| invalid_date                | "invalid_type"      |
| invalid_string              | "invalid_type"      |
| invalid_intersection_types  | "invalid_type"      |
| not_finite                  | "invalid_type"      |
```

## [1.3.0] - 2025-08-22

### Changed

- Codemod now replaces top-level API when they have args, such as `z.string().url("Please enter a valid URL")` => `z.url("Please enter a valid URL")`. ([#18](https://github.com/nicoespeon/zod-v3-to-v4/pull/18))

### Fixed

- The codemod was a bit too greedy when migrating `z.record()` patterns and would sometimes add incorrect `z.string()` params to its parent call expression (e.g., `z.array(z.record(…))` -> `z.array(z.string(), z.record(…))`). Not anymore! ([#17](https://github.com/nicoespeon/zod-v3-to-v4/pull/17))

## [1.2.0] - 2025-08-13

## Changed

- Stop migrating zod imports to `zod/v4`. It's a valid transformation, but it's only useful if you plan on staying on v3.25, which is probably not your intention when using this codemod. It's only helpful for testing purposes, so we can typecheck both v3 (before) and v4 (after). But it's not useful for users. ([#15](https://github.com/nicoespeon/zod-v3-to-v4/pull/15))

## [1.1.5] - 2025-08-11

### Fixed

- The codemod used to migrate the following methods that were looking like Zod API, although they didn't belong to Zod: `.addIssue()`, `.addIssues()`, `.format()`, `.flatten()`, and `.formErrors`. This has been fixed ([#13](https://github.com/nicoespeon/zod-v3-to-v4/pull/13)). It may result in the codemod missing some transformations now, but at least it won't break your code. Please [report any missing transformation as an enhancement](https://github.com/nicoespeon/zod-v3-to-v4/issues/new?assignees=&labels=enhancement&template=enhancement.md&title=) for the codemod.
- Don't fail migration when matching nested arguments that are not related Zod. E.g. `z.string().url().safeParse(stripeSession.url)` won't attempt to transform `stripeSession.url` anymore ([#14](https://github.com/nicoespeon/zod-v3-to-v4/pull/14)).

## [1.1.4] - 2025-08-03

### Fixed

- Don't replace `z.coerce` with top-level APIs because it would change the behaviour ([#12](https://github.com/nicoespeon/zod-v3-to-v4/pull/12)).
- Target more specifically the descendants of Zod references to avoid transforming code that doesn't belong to Zod ([#9](https://github.com/nicoespeon/zod-v3-to-v4/pull/9)).
- Support chained `.or()`, `.and()` and `.pipe()` schemas. So transforming `z.string().or(z.number().int())` produces the expected code without messing it up ([#10](https://github.com/nicoespeon/zod-v3-to-v4/pull/10)).

## [1.1.3] - 2025-07-29

### Fixed

- Fix replacements for `required_error` and `invalid_type_error` when they are variables ([#7](https://github.com/nicoespeon/zod-v3-to-v4/pull/7)).

## [1.1.2] - 2025-07-28

### Fixed

- Fix `errorMap` transformations when the function body is an arrow function ([#6](https://github.com/nicoespeon/zod-v3-to-v4/pull/6)).

## [1.1.1] - 2025-07-25

### Fixed

- Stop transforming `message` property keys to `error` when they don't belong to a Zod schema. It was happening in some cases if there was a Zod reference within scope.

## [1.1.0] - 2025-07-25

### Added

- Transform deprecated `z.object().merge()` to `z.object().extend()`
- Support for `z.string().date()`, `z.string().time()`, `z.string().datetime()`, and `z.string().duration()` to `z.iso.*()` ([#4](https://github.com/nicoespeon/zod-v3-to-v4/pull/4))
- Passing an enum as the first argument of a `z.record()` will now be migrated to `z.partialRecord()` [to preserve the partial type](https://zod.dev/v4/changelog?id=improves-enum-support).

### Fixed

- Fixed some scenarios where nested `z.object()` would produced an invalid `z.undefined()` ([#3](https://github.com/nicoespeon/zod-v3-to-v4/issues/3)).
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

[Unreleased]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.11.0...HEAD
[1.11.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.10.0...1.11.0
[1.10.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.9.0...1.10.0
[1.9.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.8.0...1.9.0
[1.8.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.7.1...1.8.0
[1.7.1]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.7.0...1.7.1
[1.7.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.6.1...1.7.0
[1.6.1]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.6.0...1.6.1
[1.6.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.5...1.2.0
[1.1.5]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.4...1.1.5
[1.1.4]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.3...1.1.4
[1.1.3]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.2...1.1.3
[1.1.2]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/nicoespeon/zod-v3-to-v4/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/nicoespeon/zod-v3-to-v4/compare/84de37227de3b85c13458b6637b57b7cc95a799b...1.0.0
