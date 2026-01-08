# Release $ARGUMENTS

Prepare a new release for this project.

## Instructions

1. Read the current `CHANGELOG.md` and `package.json`

2. Determine the version number:

   - If a version is provided as argument (`$ARGUMENTS`), use that version
   - If no version is provided, infer it from the Unreleased section in CHANGELOG.md:
     - Look at the subsections under `## Unreleased`
     - If there's a `### Breaking Changes` section → **major** bump (e.g., 1.2.3 → 2.0.0)
     - If there's an `### Added` or `### Changed` section → **minor** bump (e.g., 1.2.3 → 1.3.0)
     - If there's only `### Fixed` → **patch** bump (e.g., 1.2.3 → 1.2.4)
     - Get the current version from `package.json` and apply the appropriate bump
     - **Ask the user to confirm** the inferred version before proceeding (they may want a different version)

3. Update the CHANGELOG:

   - Create a new version section `## [<version>] - <today's date in YYYY-MM-DD format>` right after the `## Unreleased` section
   - Move all content from "Unreleased" to the new version section
   - Leave an empty "Unreleased" section for future changes
   - Update the links at the bottom:
     - Change `[Unreleased]` to compare from the new version
     - Add a new link for the new version comparing from the previous version

4. Update `package.json`:

   - Change the `version` field to the new version

5. Commit the changes:
   - Stage `CHANGELOG.md` and `package.json`
   - Commit with message: `Bump to v<version>` (e.g., "Bump to v1.12.0")
