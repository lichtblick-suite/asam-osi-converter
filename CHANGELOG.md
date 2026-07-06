# Changelog

All notable changes to this project will be documented in this file.
## [1.0.1](https://github.com/lichtblick-suite/asam-osi-converter/tree/v1.0.1) — 2026-07-06

### 🏗️ Build

- Bump esbuild (#202)

### 🐛 Bug Fixes

- Per-panel scene state for toggles and stale entities (#205)
- Use git-cliff and gh release for changelog (#198)
- Remove push tag trigger to prevent release loop (#195)

### 📚 Documentation

- Update CHANGELOG for v1.0.0 [skip ci]

### 📦 Dependencies

- Bump @babel/core (#204)
- Bump form-data in the npm_and_yarn group across 1 directory (#203)
- Bump @tootallnate/once (#199)
- Bump fast-uri in the npm_and_yarn group across 1 directory (#196)

### 🔧 Miscellaneous

- Add ASAM OpenX standards submodule (#201)
## [1.0.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v1.0.0) — 2026-05-05

### ⚙️ CI/CD

- Prevent workflow trigger loop on tag push

### 🐛 Bug Fixes

- Add persist-credentials: false to unblock PAT push (#194)
- Use PAT_TOKEN for tag push in release workflow (#193)

### 🔧 Miscellaneous

- Patch brace-expansion ReDoS vulnerabilities (#192)
- Migrate to ESLint 9 and @lichtblick/eslint-plugin 2.x (#191)
- Upgrade @foxglove/schemas from 1.6.2 to 1.9.0 (#190)

### 🚀 Features

- Add sampling support to all converters (#187)
- Add caching stable geometry disclaimer (#189)
## [0.2.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.2.0) — 2026-03-30

### ♻️ Refactoring

- Replace O(L*B) lane boundary lookups with Map-based O(L+B) (#176)
- Optimize converter array assembly and host vehicle lookup (#177)
- Replace O(n²) lane boundary dedup with O(n) Set-based approach (#175)

### ⚙️ CI/CD

- Add workflow_dispatch trigger with version validation

### 🐛 Bug Fixes

- Accept both '0.2.0' and 'v0.2.0' as confirmation input
- Remove temporary billboard text for sensordata (#188)
- Replace triangle list with cube primitive, add axis arrows (#183)
- Replace boundary merge with per-segment processing (#173)
- Avoid NaN on zero-length line segments (#170)

### 📚 Documentation

- Update MCAP format status and release process
- Add Docusaurus documentation site (#185)
- Update CHANGELOG for v0.1.4

### 📦 Dependencies

- Bump handlebars (#184)
- Bump flatted in the npm_and_yarn group across 1 directory (#171)

### 🔧 Miscellaneous

- Align dependency versions with Lichtblick framework (#182)
- Patch picomatch ReDoS vulnerabilities (#179)
- Bump version to 0.2.0 (#178)
- Bump minimum Node.js engine to >=20.19.0 (#167)
- Bump version to 0.1.5, update agent docs and gitignore (#169)

### 🚀 Features

- Use emitAlert hook for basic conversion fails (#174)
## [0.1.4](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.4) — 2026-03-06

### 🐛 Bug Fixes

- Resolve topic visibility (#165)
- Use config signature to avoid stale cache (#164)

### 📚 Documentation

- Update CHANGELOG for v0.1.3

### 🔧 Miscellaneous

- Bump version and update deps (#166)
## [0.1.3](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.3) — 2026-02-05

### 🐛 Bug Fixes

- Use SensorView fallback host vehicle if missing (#160)
- Hide lights if unknown (#158)

### 📚 Documentation

- Update CHANGELOG for v0.1.2

### 🔧 Miscellaneous

- Bump version, copilot /init, implementation plan (#161)

### 🚀 Features

- Add switchable reference line visualization (#159)
- Add virtual mounting position frame transform (#157)
## [0.1.2](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.2) — 2025-12-11

### 📚 Documentation

- Update CHANGELOG for v0.1.1

### 🚀 Features

- Add traffic light box colors (#156)
- Enable traffic light mode switching, add traffic light axes, support flashing (#155)
## [0.1.1](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.1) — 2025-12-05

### 🐛 Bug Fixes

- Missing metadata bug (#153)

### 📚 Documentation

- Update CHANGELOG for v0.1.0

### 🔧 Miscellaneous

- Bump version (#154)
## [0.1.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.0) — 2025-12-05

### ♻️ Refactoring

- Repository reorganization/cleanup/fix logical lanes and panel settings (#146)

### ⚙️ CI/CD

- Switch to PAT_TOKEN (#150)

### 🔧 Miscellaneous

- Provide token to changelog generator (#152)
- Bump version (#151)
## [0.0.9](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.9) — 2025-10-24

### 🐛 Bug Fixes

- Remove logical lane centerline (#143)

### 📚 Documentation

- Update CHANGELOG for release (#141)
## [0.0.8](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.8) — 2025-10-10

### 📚 Documentation

- Update CHANGELOG for release v0.0.7 (#133)

### 🚀 Features

- Rename "<root>" frame transform to  to ASAM OSI "global" , increase geometry.ts robustness (#137)
## [0.0.7](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.7) — 2025-09-04

### 🐛 Bug Fixes

- Use new assigned_lane_id instead of deprecated one (#128)
- The type error after vehicle lights implementation (#119)
- Out of bounding box issue (#118)
- Simplify deletion logic (#113)
- Update release.yaml (#104)

### 📦 Dependencies

- Bump form-data in the npm_and_yarn group across 1 directory (#110)

### 🔧 Miscellaneous

- Bump version (#121)

### 🚀 Features

- Add additional metadata for moving objects (#123)
- Add disappearing vehicle example (#120)
- Visualize logical lanes (#107)
- Add stop line road marking (#106)
- Add frame transform between ego bb and ego vehicle rear axis (#105)
## [0.0.6](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.6) — 2025-05-07

### 🏗️ Build

- Bump to v0.0.6, update package locks, update workflow versions (#102)

### 🐛 Bug Fixes

- Mirror textures and traffic sign values (#101)
- Remove broken traffic sign optimization (#95)

### 📚 Documentation

- Update CHANGELOG for release v0.0.5 (#88)

### 🚀 Features

- Add options for cache and object axes (#100)
- Add info for unhandled sensordata (#98)
## [0.0.5](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.5) — 2025-03-07

### Fix

- CI Limit header extraction (#79)

### 🏗️ Build

- Bump version of ASAM OSI Converter, update ci (#87)

### 🚀 Features

- Add lane boundary and lane implementation including color schema and temporary caching (#81)
## [0.0.4](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.4) — 2025-02-15

### 🐛 Bug Fixes

- Update package-lock files and replace npm with yarn in workflow (#76)
- Split up and fix frame transforms, increase robustness (#72)
- Lane boundaries without z-values (#65)
- Rotation angles (#64)

### 📚 Documentation

- Update README.md (#75)
- Create README.md for traffic sign images (#70)
- Update CHANGELOG manually for release v0.0.3 (#60)
## [0.0.3](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.3) — 2024-12-17

### ⚙️ CI/CD

- Update workflow (#58)
- Update workflow (#57)
- Preserve state across jobs (#56)
- Split jobs (#54)
- Update workflow (#53)
- Update workflow (#52)
- Update workflow (#50)
- Update workflow (#49)
- Add changes stashing before and after pull (#46)
- Specifiy pull reconcilation (#45)
- Force changes in changelog commit (#44)
- Add branch pull action before commit (#43)
- Add commit step to update-changelog branch (#42)
- Handle staging with create-pull-request action (#40)
- Add PAT to PR creation step (#36)
- Remove uppercase start from commit message (#35)
- Update PR commit message (#34)
- Add initial commit history fetch job to pipeline (#32)
- Adapt pipeline workflow (#31)
- Update workflow (#27)
- Add initial commit history to workflow|bump version to 0.0.2 (#26)
- Attach changelog to release instead of committing to main (#24)

### 🐛 Bug Fixes

- Release pipeline fix (#25)
## [0.0.2](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.2) — 2024-12-12

### Ci

- Release pipeline (#23)

### Doc

- Create README.md for example data (#20)

### ⚙️ CI/CD

- Remove trigger on PRs from workflow (#21)

### 🚀 Features

- Automate changelog creation and update (#18)
## [0.0.1](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.1) — 2024-10-18

