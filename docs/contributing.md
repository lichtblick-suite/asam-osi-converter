---
sidebar_position: 6
---

# Contributing

For the general Lichtblick extension development workflow, see the [Local Development guide](https://lichtblick-suite.github.io/docs/docs/extensions/local-development). This extension uses `yarn`:

```bash
yarn install          # Install dependencies
yarn build            # Build extension
yarn test             # Run tests
yarn lint             # Lint with auto-fix
yarn lint:ci          # Lint without auto-fix (CI mode)
yarn local-install    # Build and install into local Lichtblick
yarn package          # Create .foxe distribution file
```

## Coding conventions

- **Language:** TypeScript with strict settings
- **Formatting:** Prettier (2-space indent, 100-char line width, semicolons, LF line endings)
- **Linting:** ESLint with `@lichtblick` configs
- **Imports:** Use path aliases (`@utils/`, `@features/`, `@converters`, `@assets/`, `@/`)

## Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

Commits are validated by commitlint via the Husky `commit-msg` hook.

## Testing

- Framework: Jest + ts-jest, `jsdom` environment
- Test files: `tests/**/*.spec.ts`
- Add or update tests alongside changes to converters, features, or utilities

## Adding a new feature

1. Create feature module in `src/features/<name>/` with `build<Name>Entity()` and optionally `build<Name>Metadata()`
2. Add entity prefix in `src/config/entityPrefixes.ts`
3. Add color/rendering constants in `src/config/constants.ts`
4. Wire into GroundTruth converter in `src/converters/groundTruth/sceneUpdateConverter.ts`
5. Add panel setting if the feature needs a visibility toggle
6. Add tests in `tests/<name>.spec.ts`

## Release process

1. Audit dependencies: `yarn audit --summary`
2. Bump version in `package.json`
3. Commit and push
4. Tag: `git tag -s -a v<version> -m "Release v<version>"`
5. Push tag: `git push origin v<version>`

The GitHub Actions workflow builds the `.foxe` file and creates a release automatically.
