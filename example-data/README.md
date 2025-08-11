# Create ASAM OSI MCAP files

The [multi trace format definition](https://github.com/OpenSimulationInterface/open-simulation-interface/pull/841) is implemented in the [ASAM OSI Utilities](https://github.com/Lichtblick-Suite/asam-osi-utilities/tree/main/examples) where you can use the `convert_osi2mcap` example to convert a standard compliant `.osi` trace to an mcap trace.
You can use e.g. esmini to create `.osi` trace files.
Take a look at the [OpenMSL actions](https://github.com/openMSL/sl-1-0-sensor-model-repository-template/tree/main/test/integration/003_output_osi_fields) how to run a complete co-simulation.

Another option to create traces is the OpenPASS [gt-gen-simlator](https://gitlab.eclipse.org/eclipse/openpass/gt-gen-simulator).

## Example traces

### Moving Host with Stop Line

**File Name:** MovingHostWithStopLine.mcap

With this MCAP you can simply test stop line road marking.

### Moving Host with 3D Model

**File Name:** MovingHostWith3DModel.mcap

With this MCAP you can test 3D model visualization of moving objects. To do test properly, you should copy the `models/MilkTruck.glTF` file to `/opt/models/vehicles/MilkTruck.glTF` in your file system. Also don't forget to start Lichtblick with `--allow-file-access-from-files` argument:

```
lichtblick --allow-file-access-from-files
```

[Milk Truck](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/CesiumMilkTruck) model has taken from [Khronos glTF Examples](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0).
