# ASAM OSI Converter extension for Lichtblick

## What is this extension about?

A converter extension which visualizes data following the standard of the [ASAM Open Simulation Interface (ASAM OSI)](https://www.asam.net/standards/detail/osi/) using the native 3D panel of Lichtblick.

:warning: **Current version not compliant with official ASAM OSI**:

Current ASAM OSI [tracefile formats](https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/interface/architecture/trace_file_formats.html) do not yet include the draft for the MCAP Multitrace Format. This will be officially completed in this [OpenX Project Proposal](https://code.asam.net/simulation/openx/-/issues/17). You can use the [ASAM OSI Utilities](https://github.com/Lichtblick-Suite/asam-osi-utilities/blob/main/examples/convert_osi2mcap.cpp) to create OSI MCAP traces according to the current [specification draft](https://github.com/OpenSimulationInterface/open-simulation-interface/pull/841).

## Getting started

Get Lichtblick from [github](https://github.com/Lichtblick-Suite/lichtblick/releases).

Get extension file from [releases](https://github.com/Lichtblick-Suite/asam-osi-converter/releases).

Install the extension in Lichtblick by dragging the `.foxe` file into the Lichtblick window.

Open a file/stream which is following the ASAM OSI standard.

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

## **2. Tagging for Releases**

Tags are used to create release points in the project.

### Steps to Tag a Release

1. Ensure all changes for the release are committed and pushed to the main branch.
2. Use the following command to create a new tag:

   ```bash
   git tag -s -a v<version> -m "Release v<version>"
   ```

   Example:

   ```bash
   git tag -s -a v1.0.0 -m "ASAM OSI Converter v1.0.0"
   ```

3. Push the tag to the remote repository:

   ```bash
   git push origin v<version>
   ```

---

## **3. Creating a GitHub Release**

Once the tag is pushed, create a release on GitHub:

1. Go to the **Releases** section of the repository.
2. Click **Draft a new release**.
3. Select the tag you created (e.g., `v1.0.0`).
4. Fill in the release title and notes. Use the changelog for guidance.
5. Click **Publish Release**.

---

## **4. Automating Releases**

This project includes a GitHub Actions workflow to automate changelog updates and publishing releases. Ensure the workflow is configured correctly by following these steps:

1. Push a tag (e.g., `v1.0.0`) to trigger the workflow.
2. Verify the changelog and release on GitHub.

---

## **5. Troubleshooting**

- **Commit Rejected**: Ensure your commit message follows the Conventional Commits format.
- **Empty Changelog**: Verify that commit messages are properly formatted.
- **Tag Not Found**: Push the tag using `git push origin v<version>`.

For further assistance, contact the repository codeowners.
