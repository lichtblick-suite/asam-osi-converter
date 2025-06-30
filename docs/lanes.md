# Lanes

You can find more information about lanes and its metadata from ASAM OSI standards: [osi3::Lane Struct Reference](https://www.asam.net/static_downloads/ASAM_OSI_reference-documentation_v3.5.0/structosi3_1_1Lane.html)

## Colors

Color of the lane may change depending on its type:

| Type         | Color                                  |
| ------------ | -------------------------------------- |
| UNKNOWN      | `{ r: 0.5, g: 0.5, b: 0.5, a: 0.6 }`   |
| OTHER        | `{ r: 0, g: 1, b: 1, a: 0.6 }`         |
| DRIVING      | `{ r: 0, g: 1, b: 1, a: 0.5 }`         |
| INTERSECTION | `{ r: 1, g: 0, b: 0, a: 0.3 }`         |
| NONDRIVING   | `{ r: 1, g: 0.43, b: 0.36, a: 0.5 }`   |

## Width

**Lane width:** 0.75

# Lane Boundaries

You can find more information about lane boundaries and its metadata from ASAM OSI standards: [osi3::LaneBoundary Struct Reference](https://www.asam.net/static_downloads/ASAM_OSI_reference-documentation_v3.5.0/structosi3_1_1LaneBoundary.html)

## Colors

Lane boundary colors and alpha values may change depending on `osi3::LaneBoundary::Classification::type` and `osi3::LaneBoundary::Classification::color` values.

## Width

**Minimum lane boundary width:** 0.02

# Example

In DRIVING mode:

![](/docs/images/LanesExample.png)