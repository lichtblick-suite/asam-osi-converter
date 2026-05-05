# Changelog

## [v1.0.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v1.0.0) (2026-05-05)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.2.0...v1.0.0)

**Fixed bugs:**

- fix\(ci\): add persist-credentials: false to unblock PAT push [\#194](https://github.com/lichtblick-suite/asam-osi-converter/pull/194) ([jdsika](https://github.com/jdsika))
- fix\(ci\): use PAT\_TOKEN for tag push in release workflow [\#193](https://github.com/lichtblick-suite/asam-osi-converter/pull/193) ([jdsika](https://github.com/jdsika))

**Closed issues:**

- chore: remaining security vulnerabilities blocked on eslint@9 migration [\#180](https://github.com/lichtblick-suite/asam-osi-converter/issues/180)
- Performance issue: please add possibility to decrease amount of info visualized via GUI [\#135](https://github.com/lichtblick-suite/asam-osi-converter/issues/135)
- @foxglove/schemas [\#97](https://github.com/lichtblick-suite/asam-osi-converter/issues/97)

**Merged pull requests:**

- chore\(deps\): patch brace-expansion ReDoS vulnerabilities [\#192](https://github.com/lichtblick-suite/asam-osi-converter/pull/192) ([jdsika](https://github.com/jdsika))
- chore\(deps\): migrate to ESLint 9 and @lichtblick/eslint-plugin 2.x [\#191](https://github.com/lichtblick-suite/asam-osi-converter/pull/191) ([jdsika](https://github.com/jdsika))
- chore\(deps\): upgrade @foxglove/schemas from 1.6.2 to 1.9.0 [\#190](https://github.com/lichtblick-suite/asam-osi-converter/pull/190) ([jdsika](https://github.com/jdsika))
- feat: add caching stable geometry disclaimer [\#189](https://github.com/lichtblick-suite/asam-osi-converter/pull/189) ([thomassedlmayer](https://github.com/thomassedlmayer))
- feat: add sampling support to all converters [\#187](https://github.com/lichtblick-suite/asam-osi-converter/pull/187) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.2.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.2.0) (2026-03-30)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.1.4...v0.2.0)

**Implemented enhancements:**

- refactor: optimize converter array assembly and host vehicle lookup [\#177](https://github.com/lichtblick-suite/asam-osi-converter/pull/177) ([jdsika](https://github.com/jdsika))
- refactor: replace O\(L\*B\) lane boundary lookups with Map-based O\(L+B\) [\#176](https://github.com/lichtblick-suite/asam-osi-converter/pull/176) ([jdsika](https://github.com/jdsika))
- refactor: replace O\(n²\) lane boundary dedup with O\(n\) Set-based approach [\#175](https://github.com/lichtblick-suite/asam-osi-converter/pull/175) ([jdsika](https://github.com/jdsika))
- feat: use emitAlert hook for basic conversion fails [\#174](https://github.com/lichtblick-suite/asam-osi-converter/pull/174) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Fix/caching-improvements [\#172](https://github.com/lichtblick-suite/asam-osi-converter/pull/172) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Fixed bugs:**

- Road marking dimension/position/orientation issues [\#114](https://github.com/lichtblick-suite/asam-osi-converter/issues/114)
- fix\(roadmarkings\): replace triangle list with cube primitive, add axis arrows [\#183](https://github.com/lichtblick-suite/asam-osi-converter/pull/183) ([jdsika](https://github.com/jdsika))
- fix: replace boundary merge with per-segment processing [\#173](https://github.com/lichtblick-suite/asam-osi-converter/pull/173) ([thomassedlmayer](https://github.com/thomassedlmayer))
- fix: avoid NaN on zero-length line segments [\#170](https://github.com/lichtblick-suite/asam-osi-converter/pull/170) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Closed issues:**

- chore: align dependency versions with Lichtblick framework [\#162](https://github.com/lichtblick-suite/asam-osi-converter/issues/162)
- docs: document caching, panel settings, and architecture [\#103](https://github.com/lichtblick-suite/asam-osi-converter/issues/103)
- Feature: Adding intermediate `"odometry"` frame between `<root>` and the vehicle's frames [\#92](https://github.com/lichtblick-suite/asam-osi-converter/issues/92)
- Performance issue: please add possibility to decrease amount of info visualized via GUI [\#135](https://github.com/lichtblick-suite/asam-osi-converter/issues/135)

**Merged pull requests:**

- fix: remove temporary billboard text for sensordata [\#188](https://github.com/lichtblick-suite/asam-osi-converter/pull/188) ([thomassedlmayer](https://github.com/thomassedlmayer))
- docs: add Docusaurus documentation site [\#185](https://github.com/lichtblick-suite/asam-osi-converter/pull/185) ([jdsika](https://github.com/jdsika))
- build\(deps\): bump handlebars from 4.7.8 to 4.7.9 in the npm\_and\_yarn group across 1 directory [\#184](https://github.com/lichtblick-suite/asam-osi-converter/pull/184) ([dependabot[bot]](https://github.com/apps/dependabot))
- chore\(deps\): align dependency versions with Lichtblick framework [\#182](https://github.com/lichtblick-suite/asam-osi-converter/pull/182) ([jdsika](https://github.com/jdsika))
- chore\(deps\): patch picomatch ReDoS vulnerabilities [\#179](https://github.com/lichtblick-suite/asam-osi-converter/pull/179) ([jdsika](https://github.com/jdsika))
- chore: bump version to 0.2.0 [\#178](https://github.com/lichtblick-suite/asam-osi-converter/pull/178) ([jdsika](https://github.com/jdsika))
- build\(deps\): bump flatted from 3.3.4 to 3.4.2 in the npm\_and\_yarn group across 1 directory [\#171](https://github.com/lichtblick-suite/asam-osi-converter/pull/171) ([dependabot[bot]](https://github.com/apps/dependabot))
- chore: bump version to 0.1.5, update agent docs and gitignore [\#169](https://github.com/lichtblick-suite/asam-osi-converter/pull/169) ([jdsika](https://github.com/jdsika))
- chore\(deps\): bump minimum Node.js engine to \>=20.19.0 [\#167](https://github.com/lichtblick-suite/asam-osi-converter/pull/167) ([jdsika](https://github.com/jdsika))

## [v0.1.4](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.4) (2026-03-06)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.1.3...v0.1.4)

**Merged pull requests:**

- chore: bump version and update deps [\#166](https://github.com/lichtblick-suite/asam-osi-converter/pull/166) ([thomassedlmayer](https://github.com/thomassedlmayer))
- fix: resolve topic visibility [\#165](https://github.com/lichtblick-suite/asam-osi-converter/pull/165) ([gabriela-almeida-ctw](https://github.com/gabriela-almeida-ctw))
- fix: use config signature to avoid stale cache [\#164](https://github.com/lichtblick-suite/asam-osi-converter/pull/164) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.1.3](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.3) (2026-02-05)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.1.2...v0.1.3)

**Implemented enhancements:**

- Reminder: Reference line for logical lanes [\#144](https://github.com/lichtblick-suite/asam-osi-converter/issues/144)
- Reorganization/cleanup [\#146](https://github.com/lichtblick-suite/asam-osi-converter/pull/146) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Fixed bugs:**

- Bug: Traffic light back side [\#134](https://github.com/lichtblick-suite/asam-osi-converter/issues/134)
- Bug: Traffic lights color changes properly? [\#131](https://github.com/lichtblick-suite/asam-osi-converter/issues/131)
- Light state visualization for partially set light states [\#129](https://github.com/lichtblick-suite/asam-osi-converter/issues/129)
- MCAP/OSI visualization not working - GroundTruth & SensorView [\#109](https://github.com/lichtblick-suite/asam-osi-converter/issues/109)
- fix: use SensorView fallback host vehicle if missing [\#160](https://github.com/lichtblick-suite/asam-osi-converter/pull/160) ([thomassedlmayer](https://github.com/thomassedlmayer))
- fix: hide lights if unknown [\#158](https://github.com/lichtblick-suite/asam-osi-converter/pull/158) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Closed issues:**

- Should I commit yarn.lock and package-lock.json files? [\#86](https://github.com/lichtblick-suite/asam-osi-converter/issues/86)

**Merged pull requests:**

- Chore/prepare v0.1.3 [\#163](https://github.com/lichtblick-suite/asam-osi-converter/pull/163) ([jdsika](https://github.com/jdsika))
- chore: release v0.1.3 [\#161](https://github.com/lichtblick-suite/asam-osi-converter/pull/161) ([jdsika](https://github.com/jdsika))
- feat: add switchable reference line visualization [\#159](https://github.com/lichtblick-suite/asam-osi-converter/pull/159) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Add virtual mounting position frame transform [\#157](https://github.com/lichtblick-suite/asam-osi-converter/pull/157) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.1.2](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.2) (2025-12-11)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.1.1...v0.1.2)

**Implemented enhancements:**

- Add traffic light box colors [\#156](https://github.com/lichtblick-suite/asam-osi-converter/pull/156) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Enable traffic light mode switching, add traffic light axes, support flashing [\#155](https://github.com/lichtblick-suite/asam-osi-converter/pull/155) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.1.1](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.1) (2025-12-05)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.1.0...v0.1.1)

**Merged pull requests:**

- chore: bump version [\#154](https://github.com/lichtblick-suite/asam-osi-converter/pull/154) ([thomassedlmayer](https://github.com/thomassedlmayer))
- fix: missing metadata bug [\#153](https://github.com/lichtblick-suite/asam-osi-converter/pull/153) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.1.0](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.1.0) (2025-12-05)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.9...v0.1.0)

**Closed issues:**

- Magic numbers in the code [\#68](https://github.com/lichtblick-suite/asam-osi-converter/issues/68)

**Merged pull requests:**

- chore: provide token to changelog generator [\#152](https://github.com/lichtblick-suite/asam-osi-converter/pull/152) ([thomassedlmayer](https://github.com/thomassedlmayer))
- chore: bump version [\#151](https://github.com/lichtblick-suite/asam-osi-converter/pull/151) ([thomassedlmayer](https://github.com/thomassedlmayer))
- ci: switch to PAT\_TOKEN [\#150](https://github.com/lichtblick-suite/asam-osi-converter/pull/150) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.0.9](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.9) (2025-10-24)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.8...v0.0.9)

**Fixed bugs:**

- OSI::SensorData Frame Transform Error [\#138](https://github.com/lichtblick-suite/asam-osi-converter/issues/138)
- Allow unset velocity and acceleration? [\#124](https://github.com/lichtblick-suite/asam-osi-converter/issues/124)
- fix: remove logical lane centerline [\#143](https://github.com/lichtblick-suite/asam-osi-converter/pull/143) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Fix/allow unset values in metadata [\#142](https://github.com/lichtblick-suite/asam-osi-converter/pull/142) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Closed issues:**

- OSI::GroundTruth messages objects not rendering in 3D panel after v0.0.7 update [\#139](https://github.com/lichtblick-suite/asam-osi-converter/issues/139)
- Reminder: Use Const [\#136](https://github.com/lichtblick-suite/asam-osi-converter/issues/136)

**Merged pull requests:**

- Update CHANGELOG for new release [\#141](https://github.com/lichtblick-suite/asam-osi-converter/pull/141) ([jdsika](https://github.com/jdsika))
- feat: rename "\<root\>" frame transform to  to ASAM OSI "global" , increase geometry.ts robustness [\#137](https://github.com/lichtblick-suite/asam-osi-converter/pull/137) ([jdsika](https://github.com/jdsika))

## [v0.0.8](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.8) (2025-10-10)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.7...v0.0.8)

## [v0.0.7](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.7) (2025-09-04)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.6...v0.0.7)

**Implemented enhancements:**

- feat: add disappearing vehicle example [\#120](https://github.com/lichtblick-suite/asam-osi-converter/pull/120) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Visualize brake and indicator lights - Follow Up [\#118](https://github.com/lichtblick-suite/asam-osi-converter/pull/118) ([buraktiryaki](https://github.com/buraktiryaki))
- Visualize brake and indicator lights [\#115](https://github.com/lichtblick-suite/asam-osi-converter/pull/115) ([buraktiryaki](https://github.com/buraktiryaki))
- Visualize the stop line road marking [\#106](https://github.com/lichtblick-suite/asam-osi-converter/pull/106) ([myemural](https://github.com/myemural))

**Fixed bugs:**

- Revert "Add frame transform between ego bb and ego vehicle rear axis" [\#116](https://github.com/lichtblick-suite/asam-osi-converter/pull/116) ([jdsika](https://github.com/jdsika))
- fix\(ci\): Update release.yaml [\#104](https://github.com/lichtblick-suite/asam-osi-converter/pull/104) ([jdsika](https://github.com/jdsika))

**Closed issues:**

- Use of deprecated assigned\_lane\_id [\#125](https://github.com/lichtblick-suite/asam-osi-converter/issues/125)
- Docs: README.md and CHANGELOG.md not visible [\#85](https://github.com/lichtblick-suite/asam-osi-converter/issues/85)

**Merged pull requests:**

- build\(deps\): bump form-data from 4.0.1 to 4.0.4 in the npm\_and\_yarn group across 1 directory [\#110](https://github.com/lichtblick-suite/asam-osi-converter/pull/110) ([dependabot[bot]](https://github.com/apps/dependabot))
- Update CHANGELOG for new release [\#133](https://github.com/lichtblick-suite/asam-osi-converter/pull/133) ([jdsika](https://github.com/jdsika))
- use new assigned\_lane\_id instead of deprecated one [\#128](https://github.com/lichtblick-suite/asam-osi-converter/pull/128) ([buraktiryaki](https://github.com/buraktiryaki))
- feat: add additional metadata for moving objects 2 [\#123](https://github.com/lichtblick-suite/asam-osi-converter/pull/123) ([buraktiryaki](https://github.com/buraktiryaki))
- chore: bump version [\#121](https://github.com/lichtblick-suite/asam-osi-converter/pull/121) ([jdsika](https://github.com/jdsika))
- fix: the type error after vehicle lights implementation [\#119](https://github.com/lichtblick-suite/asam-osi-converter/pull/119) ([buraktiryaki](https://github.com/buraktiryaki))
- External 3D Asset Rendering [\#117](https://github.com/lichtblick-suite/asam-osi-converter/pull/117) ([myemural](https://github.com/myemural))
- fix: simplify deletion logic [\#113](https://github.com/lichtblick-suite/asam-osi-converter/pull/113) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Visualize logical lanes [\#107](https://github.com/lichtblick-suite/asam-osi-converter/pull/107) ([myemural](https://github.com/myemural))
- Add frame transform between ego bb and ego vehicle rear axis [\#105](https://github.com/lichtblick-suite/asam-osi-converter/pull/105) ([rmessaou](https://github.com/rmessaou))

## [v0.0.6](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.6) (2025-05-07)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.5...v0.0.6)

**Implemented enhancements:**

- feat: add options for cache and object axes [\#100](https://github.com/lichtblick-suite/asam-osi-converter/pull/100) ([thomassedlmayer](https://github.com/thomassedlmayer))
- Fix/infinite object lifetime [\#94](https://github.com/lichtblick-suite/asam-osi-converter/pull/94) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Fixed bugs:**

- fix: mirror textures and traffic sign values [\#101](https://github.com/lichtblick-suite/asam-osi-converter/pull/101) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Closed issues:**

- Handle OSI:SD gracefully [\#96](https://github.com/lichtblick-suite/asam-osi-converter/issues/96)
- Are rotations handled in OSI:SV and OSI:GT the same way? [\#93](https://github.com/lichtblick-suite/asam-osi-converter/issues/93)
- Issue: Moving Objects "Accumulate" During Trace-Playback [\#91](https://github.com/lichtblick-suite/asam-osi-converter/issues/91)
- Issue: Lane Boundary Caching Based Solely on ID Hash Leads to Stale Visualizations [\#90](https://github.com/lichtblick-suite/asam-osi-converter/issues/90)
- Traffic sign orientation incorrect [\#89](https://github.com/lichtblick-suite/asam-osi-converter/issues/89)
- Rework: Conditions for re-rendering and caching [\#78](https://github.com/lichtblick-suite/asam-osi-converter/issues/78)

**Merged pull requests:**

- build: bump to v0.0.6, update package locks, update workflow versions [\#102](https://github.com/lichtblick-suite/asam-osi-converter/pull/102) ([jdsika](https://github.com/jdsika))
- Add info for unhandled SensorData [\#98](https://github.com/lichtblick-suite/asam-osi-converter/pull/98) ([thomassedlmayer](https://github.com/thomassedlmayer))
- fix: remove broken traffic sign optimization [\#95](https://github.com/lichtblick-suite/asam-osi-converter/pull/95) ([thomassedlmayer](https://github.com/thomassedlmayer))

## [v0.0.5](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.5) (2025-03-07)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.4...v0.0.5)

**Implemented enhancements:**

- CI Release: Add sha of artifacts [\#84](https://github.com/lichtblick-suite/asam-osi-converter/issues/84)
- build: bump version of ASAM OSI Converter, npm audit fix --force [\#87](https://github.com/lichtblick-suite/asam-osi-converter/pull/87) ([jdsika](https://github.com/jdsika))
- feat: add lane boundary and lane implementation and temporary caching [\#81](https://github.com/lichtblick-suite/asam-osi-converter/pull/81) ([jdsika](https://github.com/jdsika))

**Fixed bugs:**

- Limit header extraction [\#79](https://github.com/lichtblick-suite/asam-osi-converter/pull/79) ([samikachai](https://github.com/samikachai))

**Closed issues:**

- Optimization: Write one LanePrimitive function with optional parameters [\#66](https://github.com/lichtblick-suite/asam-osi-converter/issues/66)

**Merged pull requests:**

- Update CHANGELOG for new release [\#88](https://github.com/lichtblick-suite/asam-osi-converter/pull/88) ([samikachai](https://github.com/samikachai))

## [v0.0.4](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.4) (2025-02-15)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.3...v0.0.4)

**Implemented enhancements:**

- fix: split up and fix frame transforms, increase robustness [\#72](https://github.com/lichtblick-suite/asam-osi-converter/pull/72) ([thomassedlmayer](https://github.com/thomassedlmayer))

**Fixed bugs:**

- Position Z not taken into account in the converter [\#12](https://github.com/lichtblick-suite/asam-osi-converter/issues/12)
- fix\(ci\): update package-lock files and replace npm with yarn in workflow [\#76](https://github.com/lichtblick-suite/asam-osi-converter/pull/76) ([jdsika](https://github.com/jdsika))
- fix: lane boundaries without z-values [\#65](https://github.com/lichtblick-suite/asam-osi-converter/pull/65) ([jdsika](https://github.com/jdsika))
- fix: rotation angles [\#64](https://github.com/lichtblick-suite/asam-osi-converter/pull/64) ([jdsika](https://github.com/jdsika))

**Closed issues:**

- Open native binary OSI trace file [\#74](https://github.com/lichtblick-suite/asam-osi-converter/issues/74)
- Issues concerning frameTransformator function [\#67](https://github.com/lichtblick-suite/asam-osi-converter/issues/67)

**Merged pull requests:**

- docs: create README.md for traffic sign images [\#70](https://github.com/lichtblick-suite/asam-osi-converter/pull/70) ([jdsika](https://github.com/jdsika))
- Add checking workflow and replace create-foxglove-extension package [\#61](https://github.com/lichtblick-suite/asam-osi-converter/pull/61) ([samikachai](https://github.com/samikachai))
- Update CHANGELOG for new release [\#60](https://github.com/lichtblick-suite/asam-osi-converter/pull/60) ([samikachai](https://github.com/samikachai))
- Update CHANGELOG for new release [\#77](https://github.com/lichtblick-suite/asam-osi-converter/pull/77) ([samikachai](https://github.com/samikachai))
- docs: Update README.md [\#75](https://github.com/lichtblick-suite/asam-osi-converter/pull/75) ([jdsika](https://github.com/jdsika))

## [v0.0.3](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.3) (2024-12-17)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.2...v0.0.3)

**Closed issues:**

- What does "dragging the .foxe file into the Lichtblick window mean"? [\#15](https://github.com/lichtblick-suite/asam-osi-converter/issues/15)

**Merged pull requests:**

- Fix CI/CD Pipeline to generate changelog with the release and create a PR of the change. [\#59](https://github.com/lichtblick-suite/asam-osi-converter/pull/59) ([samikachai](https://github.com/samikachai))
- ci\(release\): update workflow [\#58](https://github.com/lichtblick-suite/asam-osi-converter/pull/58) ([samikachai](https://github.com/samikachai))
- ci\(release\): update workflow [\#57](https://github.com/lichtblick-suite/asam-osi-converter/pull/57) ([samikachai](https://github.com/samikachai))
- ci\(release\): preserve state across jobs [\#56](https://github.com/lichtblick-suite/asam-osi-converter/pull/56) ([samikachai](https://github.com/samikachai))
- ci\(release\): split jobs [\#54](https://github.com/lichtblick-suite/asam-osi-converter/pull/54) ([samikachai](https://github.com/samikachai))
- ci\(release\): update workflow [\#53](https://github.com/lichtblick-suite/asam-osi-converter/pull/53) ([samikachai](https://github.com/samikachai))
- ci\(release\): update workflow [\#52](https://github.com/lichtblick-suite/asam-osi-converter/pull/52) ([samikachai](https://github.com/samikachai))
- Ci  create pr to update changelog file [\#50](https://github.com/lichtblick-suite/asam-osi-converter/pull/50) ([samikachai](https://github.com/samikachai))
- ci\(release\): update workflow [\#49](https://github.com/lichtblick-suite/asam-osi-converter/pull/49) ([samikachai](https://github.com/samikachai))
- Ci  create pr to update changelog file [\#47](https://github.com/lichtblick-suite/asam-osi-converter/pull/47) ([samikachai](https://github.com/samikachai))
- ci\(release\): add changes stashing before and after pull [\#46](https://github.com/lichtblick-suite/asam-osi-converter/pull/46) ([samikachai](https://github.com/samikachai))
- ci\(release\): specifiy pull reconcilation [\#45](https://github.com/lichtblick-suite/asam-osi-converter/pull/45) ([samikachai](https://github.com/samikachai))
- ci\(release\): force changes in changelog commit [\#44](https://github.com/lichtblick-suite/asam-osi-converter/pull/44) ([samikachai](https://github.com/samikachai))
- ci\(release\): add branch pull action before commit [\#43](https://github.com/lichtblick-suite/asam-osi-converter/pull/43) ([samikachai](https://github.com/samikachai))
- ci\(release\): add commit step to update-changelog branch [\#42](https://github.com/lichtblick-suite/asam-osi-converter/pull/42) ([samikachai](https://github.com/samikachai))
- ci\(release\): handle staging with create-pull-request action [\#40](https://github.com/lichtblick-suite/asam-osi-converter/pull/40) ([samikachai](https://github.com/samikachai))
- ci\(release\): add PAT to PR creation step [\#36](https://github.com/lichtblick-suite/asam-osi-converter/pull/36) ([samikachai](https://github.com/samikachai))
- ci\(release\): remove uppercase start from commit message [\#35](https://github.com/lichtblick-suite/asam-osi-converter/pull/35) ([samikachai](https://github.com/samikachai))
- ci\(release\): update PR commit message [\#34](https://github.com/lichtblick-suite/asam-osi-converter/pull/34) ([samikachai](https://github.com/samikachai))
- Ci  create pr to update changelog file [\#33](https://github.com/lichtblick-suite/asam-osi-converter/pull/33) ([samikachai](https://github.com/samikachai))
- ci\(release\): add initial commit history fetch job to pipeline [\#32](https://github.com/lichtblick-suite/asam-osi-converter/pull/32) ([samikachai](https://github.com/samikachai))
- ci: adapt pipeline workflow [\#31](https://github.com/lichtblick-suite/asam-osi-converter/pull/31) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#30](https://github.com/lichtblick-suite/asam-osi-converter/pull/30) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#29](https://github.com/lichtblick-suite/asam-osi-converter/pull/29) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#28](https://github.com/lichtblick-suite/asam-osi-converter/pull/28) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#27](https://github.com/lichtblick-suite/asam-osi-converter/pull/27) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#26](https://github.com/lichtblick-suite/asam-osi-converter/pull/26) ([samikachai](https://github.com/samikachai))
- Ci  release pipeline fix [\#25](https://github.com/lichtblick-suite/asam-osi-converter/pull/25) ([samikachai](https://github.com/samikachai))

## [v0.0.2](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.2) (2024-12-12)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.1...v0.0.2)

**Implemented enhancements:**

- Automate CHANGELOG.md creation [\#11](https://github.com/lichtblick-suite/asam-osi-converter/issues/11)
- status checks: add build test for eyery PR [\#8](https://github.com/lichtblick-suite/asam-osi-converter/issues/8)
- ci\(release\): attach changelog to release instead of committing to main [\#24](https://github.com/lichtblick-suite/asam-osi-converter/pull/24) ([samikachai](https://github.com/samikachai))
- Install @lichtblick/asam-osi-types npm package and update imports. [\#16](https://github.com/lichtblick-suite/asam-osi-converter/pull/16) ([samikachai](https://github.com/samikachai))

**Fixed bugs:**

- ci\(release\): remove trigger on PRs from workflow [\#21](https://github.com/lichtblick-suite/asam-osi-converter/pull/21) ([samikachai](https://github.com/samikachai))
- Migrating from npm to yarn [\#10](https://github.com/lichtblick-suite/asam-osi-converter/pull/10) ([partnerAcemirMendes](https://github.com/partnerAcemirMendes))

**Closed issues:**

- Unable to visualize OSI Data [\#19](https://github.com/lichtblick-suite/asam-osi-converter/issues/19)
- remove foxglove dependencies [\#6](https://github.com/lichtblick-suite/asam-osi-converter/issues/6)

**Merged pull requests:**

- Ci  fix release pipeline [\#23](https://github.com/lichtblick-suite/asam-osi-converter/pull/23) ([samikachai](https://github.com/samikachai))
- Create README.md for example data [\#20](https://github.com/lichtblick-suite/asam-osi-converter/pull/20) ([jdsika](https://github.com/jdsika))
- Docs: automate changelog creation and update [\#18](https://github.com/lichtblick-suite/asam-osi-converter/pull/18) ([samikachai](https://github.com/samikachai))
- Remove old unneeded manually created types [\#9](https://github.com/lichtblick-suite/asam-osi-converter/pull/9) ([partnerAcemirMendes](https://github.com/partnerAcemirMendes))

## [v0.0.1](https://github.com/lichtblick-suite/asam-osi-converter/tree/v0.0.1) (2024-10-18)

[Full Changelog](https://github.com/lichtblick-suite/asam-osi-converter/compare/ea99b2bfd38f8d0b94daa96837a61fcbb29675c4...v0.0.1)

**Implemented enhancements:**

- Integrate ASAM OSI as Dependency for OSI Ground Truth Extension [\#5](https://github.com/lichtblick-suite/asam-osi-converter/pull/5) ([partnerAcemirMendes](https://github.com/partnerAcemirMendes))
- Create release with artifact on new tag [\#3](https://github.com/lichtblick-suite/asam-osi-converter/pull/3) ([Str4ken](https://github.com/Str4ken))

**Closed issues:**

- MCAP ASAM OSI files [\#4](https://github.com/lichtblick-suite/asam-osi-converter/issues/4)
- Rework the readme [\#2](https://github.com/lichtblick-suite/asam-osi-converter/issues/2)



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
