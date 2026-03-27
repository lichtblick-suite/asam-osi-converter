---
sidebar_position: 1
---

# Getting Started

## Installation

1. Download [Lichtblick](https://github.com/Lichtblick-Suite/lichtblick/releases)
2. Download the `.foxe` extension file from [releases](https://github.com/Lichtblick-Suite/asam-osi-converter/releases)
3. Drag the `.foxe` file into the Lichtblick window to install

For general information about Lichtblick extensions, see the [Lichtblick Extensions documentation](https://lichtblick-suite.github.io/docs/docs/extensions/introduction).

## Opening OSI data

Open a file or stream that follows the ASAM OSI standard. The extension supports OSI messages encoded in MCAP format.

:::warning[MCAP format draft]

Current ASAM OSI [tracefile formats](https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/interface/architecture/trace_file_formats.html) do not yet include the official MCAP Multitrace Format. You can use the [ASAM OSI Utilities](https://github.com/Lichtblick-Suite/asam-osi-utilities/blob/main/examples/convert_osi2mcap.cpp) to create OSI MCAP traces according to the current [specification draft](https://github.com/OpenSimulationInterface/open-simulation-interface/pull/841).

:::

## Development

For the general Lichtblick extension development workflow, see the [Local Development guide](https://lichtblick-suite.github.io/docs/docs/extensions/local-development). This extension uses `yarn` instead of `npm`:

```bash
yarn install          # Install dependencies
yarn local-install    # Build and install into local Lichtblick
yarn test             # Run tests
yarn lint             # Lint with auto-fix
```
