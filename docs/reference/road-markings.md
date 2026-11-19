---
sidebar_position: 3
---

# Road Markings

You can find more information about road markings and their metadata in the ASAM OSI standard: [osi3::RoadMarking Struct Reference](https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/gen/structosi3_1_1RoadMarking.html). This page is based on OSI v3.8.0.

## Geometry

A road marking is a `BaseStationary` box in the global frame:

- `base.position` is the center of the box.
- `base.orientation` rotates the box: `R = Rz(yaw) * Ry(pitch) * Rx(roll)`, and a local point `v` lies at `R * v + position` in global coordinates.
- `base.dimension` gives the edge lengths along the local axes: `length` along x, `width` along y, `height` along z.

The road marking defines the local axes as follows:

| Axis | Meaning                                                                   | Box edge                   |
| ---- | ------------------------------------------------------------------------- | -------------------------- |
| x    | View normal of the marking's 2D image area ("normally points to the sky") | `length` = paint thickness |
| y    | Across the image area                                                     | `width`                    |
| z    | From the 'bottom' to the 'top' of the image ("normally in the xy-plane")  | `height`                   |

Because `(R * e_x)_z = -sin(pitch)`, a marking lies flat on a level road only for `pitch = -π/2`. In that pose roll and yaw are coupled (gimbal lock): only `yaw + roll` is observable, and the image's bottom-to-top axis points along `yaw + roll + π`. For example, `(roll, pitch, yaw) = (0, -π/2, 210°)` and `(30°, -π/2, 180°)` describe the same marking. On a sloped road, x is the road surface normal instead of global up.

A marking with identity orientation stands upright like a sign: it is `height` tall and `length` thick.

## Rendering

| `traffic_main_sign_type` | `type`                  | Rendering                                                  |
| ------------------------ | ----------------------- | ---------------------------------------------------------- |
| `STOP`                   | any                     | One box filling the bounding box                           |
| `ZEBRA_CROSSING`         | `SYMBOLIC_TRAFFIC_SIGN` | 0.5 m stripes with 0.5 m gaps along local y, full `height` |
| `ZEBRA_CROSSING`         | other                   | One box filling the bounding box                           |
| other                    | any                     | Not rendered                                               |

The color follows `classification.monochrome_color`.

## Verification

The tests check road markings in four independent layers. If a road marking looks wrong, the failing layer shows where the problem is.

| Layer     | Question                                             | Test                                                      | Runs in CI |
| --------- | ---------------------------------------------------- | --------------------------------------------------------- | ---------- |
| Spec      | Do the OSI formulas mean what we think they mean?    | `tests/roadmarkings.geometry.spec.ts` (numeric proofs)    | Yes        |
| Converter | Does the converter compute what the formulas say?    | `tests/roadmarkings.geometry.spec.ts` (independent model) | Yes        |
| Data      | Does a trace place its markings on the road?         | `tests/exampleData.roadmarkings.spec.ts`                  | Yes        |
| Render    | Does Lichtblick draw the converter output correctly? | `tests/e2e/roadmarkings.probe.e2e.ts`                     | No         |

The converter is compared against `tests/helpers/osiGeometry.ts`, a separate implementation of the OSI formulas based on rotation matrices. It shares no math code with the converter.

### Data audit

For the first frame of every `example-data/*.mcap`, each road marking is compared with the road surface: a plane fitted to the lane boundary points within 6 m. Global up is used when no lane boundary is near.

| Rule | Check                                                                                                                     | Tolerance |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| G1   | The thinnest box edge is perpendicular to the road                                                                        | 2°        |
| G2   | The box bottom lies on the road surface                                                                                   | 0.05 m    |
| S1   | Local x (view normal) is the road normal, pointing away from the road                                                     | 2°        |
| S2   | For an `assigned_lane_id`, local z follows the lane's driving direction (either way for zebra crossings)                  | 10°       |
| E1   | `type`, `monochrome_color` (unless `PAINTED_TRAFFIC_SIGN`) and `traffic_main_sign_type` (for types 2-4) are not `UNKNOWN` | -         |

G1 and G2 do not depend on the road marking axis convention, so they also catch errors in traces that use a different convention.

### Render probe

The render probe writes six probe markings into a copy of `MovingHostWithStopLine.mcap` and adds the same markings as a plain `foxglove.SceneUpdate` topic. That topic is computed by the reference model, without the converter. Lichtblick renders both topics in an orthographic top view. For each screenshot the test:

1. Fits the image-from-world map using the centers of the solid probes, and checks that it is a proper top view (residual below 1 px, square pixels, not mirrored).
2. Compares each rendered silhouette with the prediction of the OSI model. The intersection over union (IoU) must be at least 0.9.
3. Checks that five plausible wrong conventions (transposed rotation, other Euler order, swapped `length`/`width`, the correction proposed in #186, mirrored yaw) would each fail, with an IoU below 0.5 for at least one probe.
4. Counts the zebra stripes and compares the gimbal-lock twins.

Finally, the converter screenshot must match the reference screenshot pixel by pixel. If only the converter screenshot fails, the converter is wrong. If both fail, Lichtblick or the test setup is wrong.

Run it with a local Lichtblick desktop app (on a headless machine, wrap it in `xvfb-run -a`):

```bash
LICHTBLICK_BIN=/opt/Lichtblick/lichtblick yarn test:e2e
```

The screenshots and IoU tables are attached to the test results in `test-results/e2e`.

## Known specification issues

These issues in OSI v3.8.0 affect road markings. The converter follows the normative text above.

- **`base_polygon` frame:** `BaseStationary.base_polygon` is the outline projected onto the local xy-plane, "x pointing forward and y to the left". For a road marking, local x is the view normal, so this plane is perpendicular to the painted area: the polygon can only show the marking's edge, not its shape.
- **`BaseStationary.orientation` formula:** the comment writes the transform as `Rotation(orientation) * (Origin_parent - position)`. Mapping parent to local coordinates requires the inverse rotation `Rᵀ`, so the formula contradicts the `Orientation3d` definition.
- **`\rules` vs. field notes:**
  - `monochrome_color` "need not be set" for `PAINTED_TRAFFIC_SIGN`, but its rule requires it to be set exactly in that case.
  - `traffic_main_sign_type` is only needed for types 2-4, but the two separate rules `type >= 2` and `type <= 4` together require it for every type.
- **No canonical angles:** flat markings are in gimbal lock, and the standard does not define a canonical `(roll, yaw)` pair. Consumers must compare rotations, not angles.
