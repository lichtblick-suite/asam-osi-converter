# ASAM OSI Converter version history

## [0.0.8](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.7...v0.0.8) (2025-10-10)


### Features

* rename "<root>" frame transform to  to ASAM OSI "global" , increase geometry.ts robustness ([#137](https://github.com/lichtblick-suite/asam-osi-converter/issues/137)) ([8184b04](https://github.com/lichtblick-suite/asam-osi-converter/commit/8184b0456ede91c17044262c99814214d8d3734b))



## [0.0.7](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.6...v0.0.7) (2025-09-04)


### Bug Fixes

* **ci:** Update release.yaml ([#104](https://github.com/lichtblick-suite/asam-osi-converter/issues/104)) ([53cd2b5](https://github.com/lichtblick-suite/asam-osi-converter/commit/53cd2b5ea73f19389b8a2bc255851ff75193f1b7))
* out of bounding box issue ([#118](https://github.com/lichtblick-suite/asam-osi-converter/issues/118)) ([6873cfb](https://github.com/lichtblick-suite/asam-osi-converter/commit/6873cfbe031bc279d75e480e87f35c730c7fd04e))
* simplify deletion logic ([#113](https://github.com/lichtblick-suite/asam-osi-converter/issues/113)) ([8803754](https://github.com/lichtblick-suite/asam-osi-converter/commit/8803754c682573f255bb7b29aeb7fb4052e7dd0f))
* the type error after vehicle lights implementation ([#119](https://github.com/lichtblick-suite/asam-osi-converter/issues/119)) ([a5c521d](https://github.com/lichtblick-suite/asam-osi-converter/commit/a5c521db8df15cbd04596900005ae4e251ff8ae0))
* use new assigned_lane_id instead of deprecated one ([#128](https://github.com/lichtblick-suite/asam-osi-converter/issues/128)) ([ee02c71](https://github.com/lichtblick-suite/asam-osi-converter/commit/ee02c71e91d6ebe7061e2407d7aef89a36fd3b3f))


### Features

* add additional metadata for moving objects ([#123](https://github.com/lichtblick-suite/asam-osi-converter/issues/123)) ([a030c38](https://github.com/lichtblick-suite/asam-osi-converter/commit/a030c3857c97a17d1ab6bfb3b8968e840c1c0af4))
* add disappearing vehicle example ([#120](https://github.com/lichtblick-suite/asam-osi-converter/issues/120)) ([0592bd5](https://github.com/lichtblick-suite/asam-osi-converter/commit/0592bd5b12dab5a224b75a4f17080efec75f568e))
* Add frame transform between ego bb and ego vehicle rear axis ([#105](https://github.com/lichtblick-suite/asam-osi-converter/issues/105)) ([2d86030](https://github.com/lichtblick-suite/asam-osi-converter/commit/2d860304e3011d117a4f27185c5a21f5eb2d80fb))
* add stop line road marking ([#106](https://github.com/lichtblick-suite/asam-osi-converter/issues/106)) ([8b1023d](https://github.com/lichtblick-suite/asam-osi-converter/commit/8b1023ddb75a673682d0c5b258ed56afcb3a25ea))
* Visualize logical lanes ([#107](https://github.com/lichtblick-suite/asam-osi-converter/issues/107)) ([2ebbcf8](https://github.com/lichtblick-suite/asam-osi-converter/commit/2ebbcf808fb439876ec30c499d8cf11f83759861))


### Reverts

* Revert "feat: Add frame transform between ego bb and ego vehicle rear axis (#…" (#116) ([ade792c](https://github.com/lichtblick-suite/asam-osi-converter/commit/ade792c38aaa0afd704dbdff5923e954a3d4bc82)), closes [#116](https://github.com/lichtblick-suite/asam-osi-converter/issues/116)



## [0.0.6](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.5...v0.0.6) (2025-05-07)


### Bug Fixes

* mirror textures and traffic sign values ([#101](https://github.com/lichtblick-suite/asam-osi-converter/issues/101)) ([53420bb](https://github.com/lichtblick-suite/asam-osi-converter/commit/53420bbe79c4a0285986e484d0d640b5ae390baf))
* remove broken traffic sign optimization ([#95](https://github.com/lichtblick-suite/asam-osi-converter/issues/95)) ([d31df44](https://github.com/lichtblick-suite/asam-osi-converter/commit/d31df44c4eb789bb0f477cab484360474de5b205)), closes [#94](https://github.com/lichtblick-suite/asam-osi-converter/issues/94)


### Features

* add info for unhandled sensordata ([#98](https://github.com/lichtblick-suite/asam-osi-converter/issues/98)) ([2686e4a](https://github.com/lichtblick-suite/asam-osi-converter/commit/2686e4a14f427e2d9d5fb7b0d2cbba94d847b42b))
* add options for cache and object axes ([#100](https://github.com/lichtblick-suite/asam-osi-converter/issues/100)) ([7f688cb](https://github.com/lichtblick-suite/asam-osi-converter/commit/7f688cb908dbeae4e65968e847b4c65b7f0fac06))



## [0.0.5](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.4...v0.0.5) (2025-03-07)


### Features

* add lane boundary and lane implementation including color schema and temporary caching ([#81](https://github.com/lichtblick-suite/asam-osi-converter/issues/81)) ([4c9cc52](https://github.com/lichtblick-suite/asam-osi-converter/commit/4c9cc526a1c8449ed0a42314e1fb3b928bed17f8))



## [0.0.4](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.3...v0.0.4) (2025-02-15)


### Bug Fixes

* **ci:** update package-lock files and replace npm with yarn in workflow ([#76](https://github.com/lichtblick-suite/asam-osi-converter/issues/76)) ([7e0cfba](https://github.com/lichtblick-suite/asam-osi-converter/commit/7e0cfba569d9777d1fdb6cdd30eabf596a5045ae))
* lane boundaries without z-values ([#65](https://github.com/lichtblick-suite/asam-osi-converter/issues/65)) ([cabb6c3](https://github.com/lichtblick-suite/asam-osi-converter/commit/cabb6c304cea7160dd03f34beef42c107374bb37))
* rotation angles ([#64](https://github.com/lichtblick-suite/asam-osi-converter/issues/64)) ([fb017e1](https://github.com/lichtblick-suite/asam-osi-converter/commit/fb017e14f762dec4e73ae5fe8e93081768bdfb1f))
* split up and fix frame transforms, increase robustness ([#72](https://github.com/lichtblick-suite/asam-osi-converter/issues/72)) ([6e082a1](https://github.com/lichtblick-suite/asam-osi-converter/commit/6e082a152e6cdaa62dd9efbae550d0264c0e56fd))



## [0.0.3](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.2...v0.0.3) (2024-12-17)


### Bug Fixes

* **ci:** release pipeline fix ([#25](https://github.com/lichtblick-suite/asam-osi-converter/issues/25)) ([b34e891](https://github.com/lichtblick-suite/asam-osi-converter/commit/b34e891568e6d892e3f1b03029bafae6723a4fbf))



## [0.0.2](https://github.com/lichtblick-suite/asam-osi-converter/compare/v0.0.1...v0.0.2) (2024-12-12)


### Features

* **CI/CD:** automate changelog creation and update ([#18](https://github.com/lichtblick-suite/asam-osi-converter/issues/18)) ([c511ba0](https://github.com/lichtblick-suite/asam-osi-converter/commit/c511ba061a30faf861d447ca71bff094c6b77532))



## 0.0.1 (2024-10-18)
Initial commit

Update LICENSE

Update README

Create CODEOWNERS

Jest configuration and initial unit tests

Implement TrafficSigns

Improve logic to prevent TrafficSign rerender

Synchronize OSI extension code

Fix trafficsign category modelCache

Traffic Lights Implementation

Create release with artifact on new tag (#3)

Integrate ASAM OSI as Dependency for OSI Ground Truth Extension (#5)

Remove old unneeded manually created types (#9)

Migrate from npm to yarn (#10)

Install @lichtblick/asam-osi-types npm package and update imports. (#16)
