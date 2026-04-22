# ASAM OSI Converter extension for Lichtblick

## What is this extension about?

A converter extension which visualizes data following the standard of the [ASAM Open Simulation Interface (ASAM OSI)](https://www.asam.net/standards/detail/osi/) using the native 3D panel of Lichtblick.

This extension reads OSI messages from [MCAP trace files](https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/interface/architecture/trace_file_formats.html) — the multi-channel trace format officially specified since [OSI v3.8.0-rc1](https://github.com/OpenSimulationInterface/open-simulation-interface/releases/tag/v3.8.0-rc1). You can create compliant MCAP traces using the [ASAM OSI Utilities](https://github.com/Lichtblick-Suite/asam-osi-utilities).

## Getting started

* Get Lichtblick from [github](https://github.com/Lichtblick-Suite/lichtblick/releases).
* Get extension file from [releases](https://github.com/Lichtblick-Suite/asam-osi-converter/releases).
* Install the extension in Lichtblick by dragging the `.foxe` file into the Lichtblick window.
* Open a file/stream which is following the ASAM OSI standard.

## Coding guidelines

The code should follow the coding guidelines of Lichtblick. This includes the usage of typescript, prettier, eslint and the lichtblick-suite sdk.

## Develop

Extension development uses the `yarn` package manager to install development dependencies and run build scripts.

To install extension dependencies, run `yarn` from the root of the extension package.

```sh
yarn install
```

To build and install the extension into your local Foxglove Studio desktop app, run:

```sh
yarn run local-install
```

Open the `Lichtblick` desktop (or `ctrl-R` to refresh if it is already open). Your extension is installed and available within the app.

## Package

Extensions are packaged into `.foxe` files. These files contain the metadata (package.json) and the build code for the extension.

Before packaging, make sure to set `name`, `publisher`, `version`, and `description` fields in _package.json_. When ready to distribute the extension, run:

```sh
yarn run package
```

This command will package the extension into a `.foxe` file in the local directory.

## Contributions and Release Workflow

This guide explains the steps to manage commits, tags, and releases for this project.

---

## **1. Commit Guidelines**

All commits must follow the **Conventional Commits** standard to ensure consistency and changelog generation.

### Commit Message Format

```bash
<type>(<scope>): <description>
```

#### Examples

- `feat: add new feature`
- `fix(auth): resolve a bug`
- `docs: update README.md file`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (e.g., formatting)
- `refactor`: Code restructuring without feature/bug changes
- `test`: Adding or fixing tests
- `chore`: Maintenance tasks
- `ci`: Continuous integration changes

---

## **2. Audit and Upgrade before Release**

Before tagging a release, ensure dependencies are secure and up to date.

```sh
yarn audit --summary

yarn upgrade

yarn install
```

Commit both `package.json` and`yarn.lock` before proceeding with release tagging.


Outdated packages can be identified by using

```sh
yarn outdated
```

### Important Notes

Not all upgrades are safe or compatible.
Tools like TypeScript, esbuild, ESLint, and React types may introduce breaking changes in newer versions.
Since this project relies on older but stable build tooling, prefer minor/patch updates and only adopt breaking major versions intentionally.

## **3. Release Process**

The release workflow is triggered in one of two ways:

1. **Push a signed tag:**

   ```bash
   git tag -s -a v<version> -m "Release v<version>"
   git push origin v<version>
   ```

2. **Manual trigger:** Go to **Actions → release → Run workflow** and type the version from `package.json` (e.g. `0.2.0`) to confirm.

Both paths read the version from `package.json` as the single source of truth. The tag-push path validates that the pushed tag matches `package.json`. The manual path validates the tag does not already exist and creates it automatically.

The workflow generates a changelog, builds the `.foxe` extension, runs a ScanCode license scan, and creates a GitHub Release with all artifacts.

### Steps

1. Ensure all changes for the release are committed and pushed to the main branch.
2. Bump the version in `package.json`, commit and push.
3. Either push a signed tag or use the manual trigger in GitHub Actions.

---

## **4. Troubleshooting**

- **Commit Rejected**: Ensure your commit message follows the Conventional Commits format.
- **Empty Changelog**: Verify that commit messages are properly formatted.
- **Tag Not Found**: Push the tag using `git push origin v<version>`.

For further assistance, contact the repository codeowners.
