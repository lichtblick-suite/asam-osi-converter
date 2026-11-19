# Create ASAM OSI MCAP files

The [multi trace format definition](https://github.com/OpenSimulationInterface/open-simulation-interface/pull/841) is implemented in the [ASAM OSI Utilities](https://github.com/Lichtblick-Suite/asam-osi-utilities/tree/main/examples) where you can use the `convert_osi2mcap` example to convert a standard compliant `.osi` trace to an mcap trace.
You can use e.g. esmini to create `.osi` trace files.
Take a look at the [OpenMSL actions](https://github.com/openMSL/sl-1-0-sensor-model-repository-template/tree/main/test/integration/003_output_osi_fields) how to run a complete co-simulation.

Another option to create traces is the OpenPASS [gt-gen-simlator](https://gitlab.eclipse.org/eclipse/openpass/gt-gen-simulator).

## Example traces

### Moving Host with Stop Line

**File Name:** MovingHostWithStopLine.mcap

With this MCAP you can simply test stop line road marking.

### NDS Crosswalks

**File Name:** nds_crosswalk_missing.mcap

Urban scene with two `ZEBRA_CROSSING` road markings (IDs 6452 and 6221) for testing zebra crossing visualization.

This trace does not follow the OSI road marking geometry yet, so `tests/exampleData.roadmarkings.spec.ts` fails for it. All eight road markings use identity orientation, which makes them stand upright instead of lying on the road, their boxes are up to 2.4 m off the road surface, and `monochrome_color` is `UNKNOWN`. A flat marking needs `pitch = -π/2` and `yaw + roll = lane heading + π`; see [Road Markings](../docs/reference/road-markings.md).

### Moving Host with 3D Model

**File Name:** MovingHostWith3DModel.mcap

The 3D model visualization of moving objects can be tested with this MCAP. To do so, copy the `models/MilkTruck.glTF` file to `/opt/models/vehicles/MilkTruck.glTF` or change the base path of the "Default 3D Model Path" setting in the Lichtblick 3D panel.
Start Lichtblick with `--allow-file-access-from-files` argument:

```
lichtblick --allow-file-access-from-files
```

The [Milk Truck](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/CesiumMilkTruck) model has been taken from [Khronos glTF Examples](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0).
