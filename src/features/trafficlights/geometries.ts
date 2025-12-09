const box = {
  asset: {
    generator: "COLLADA2GLTF",
    version: "2.0",
  },
  scene: 0,
  scenes: [
    {
      nodes: [0],
    },
  ],
  nodes: [
    {
      children: [1],
      matrix: [0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
    },
    {
      mesh: 0,
    },
  ],
  meshes: [
    {
      primitives: [
        {
          attributes: {
            NORMAL: 1,
            POSITION: 2,
            TEXCOORD_0: 3,
          },
          indices: 0,
          mode: 4,
          material: 0,
        },
      ],
      name: "Mesh",
    },
  ],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5123,
      count: 36,
      max: [23],
      min: [0],
      type: "SCALAR",
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126,
      count: 24,
      max: [1.0, 1.0, 1.0],
      min: [-1.0, -1.0, -1.0],
      type: "VEC3",
    },
    {
      bufferView: 1,
      byteOffset: 288,
      componentType: 5126,
      count: 24,
      max: [0.5, 0.5, 0.5],
      min: [-0.5, -0.5, -0.5],
      type: "VEC3",
    },
    {
      bufferView: 2,
      byteOffset: 0,
      componentType: 5126,
      count: 24,
      max: [6.0, 1.0],
      min: [0.0, 0.0],
      type: "VEC2",
    },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: {
          index: 0,
        },
        metallicFactor: 0.0,
      },
      name: "Texture",
    },
  ],
  textures: [
    {
      sampler: 0,
      source: 0,
    },
  ],
  images: [
    {
      uri: "",
    },
  ],
  samplers: [
    {
      magFilter: 9729,
      minFilter: 9986,
      wrapS: 10497,
      wrapT: 10497,
    },
  ],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 768,
      byteLength: 72,
      target: 34963,
    },
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: 576,
      byteStride: 12,
      target: 34962,
    },
    {
      buffer: 0,
      byteOffset: 576,
      byteLength: 192,
      byteStride: 8,
      target: 34962,
    },
  ],
  buffers: [
    {
      byteLength: 840,
      uri: "data:application/octet-stream;base64,AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAvwAAAL8AAAA/AAAAPwAAAL8AAAA/AAAAvwAAAD8AAAA/AAAAPwAAAD8AAAA/AAAAPwAAAD8AAAA/AAAAPwAAAL8AAAA/AAAAPwAAAD8AAAC/AAAAPwAAAL8AAAC/AAAAvwAAAD8AAAA/AAAAPwAAAD8AAAA/AAAAvwAAAD8AAAC/AAAAPwAAAD8AAAC/AAAAPwAAAL8AAAA/AAAAvwAAAL8AAAA/AAAAPwAAAL8AAAC/AAAAvwAAAL8AAAC/AAAAvwAAAL8AAAA/AAAAvwAAAD8AAAA/AAAAvwAAAL8AAAC/AAAAvwAAAD8AAAC/AAAAvwAAAL8AAAC/AAAAvwAAAD8AAAC/AAAAPwAAAL8AAAC/AAAAPwAAAD8AAAC/AADAQAAAAAAAAKBAAAAAAAAAwED+/38/AACgQP7/fz8AAIBAAAAAAAAAoEAAAAAAAACAQAAAgD8AAKBAAACAPwAAAEAAAAAAAACAPwAAAAAAAABAAACAPwAAgD8AAIA/AABAQAAAAAAAAIBAAAAAAAAAQEAAAIA/AACAQAAAgD8AAEBAAAAAAAAAAEAAAAAAAABAQAAAgD8AAABAAACAPwAAAAAAAAAAAAAAAP7/fz8AAIA/AAAAAAAAgD/+/38/AAABAAIAAwACAAEABAAFAAYABwAGAAUACAAJAAoACwAKAAkADAANAA4ADwAOAA0AEAARABIAEwASABEAFAAVABYAFwAWABUA",
    },
  ],
};

const plane = {
  asset: {
    generator: "Khronos glTF Blender I/O v1.7.33",
    version: "2.0",
  },
  scene: 0,
  scenes: [
    {
      name: "Scene",
      nodes: [1],
    },
  ],
  nodes: [
    {
      mesh: 0,
      name: "Mesh",
    },
    {
      children: [0],
      name: "Node_0",
      rotation: [-0.5, 0.5, 0.5, 0.5],
    },
  ],
  materials: [
    {
      alphaMode: "BLEND",
      doubleSided: false,
      name: "FrontTexture",
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: { index: 0 },
        metallicFactor: 0,
      },
    },
    {
      alphaMode: "OPAQUE",
      doubleSided: true,
      name: "BackBlack",
      pbrMetallicRoughness: {
        baseColorFactor: [0, 0, 0, 1],
        metallicFactor: 0,
      },
    },
  ],
  meshes: [
    {
      name: "Mesh",
      primitives: [
        {
          attributes: {
            POSITION: 0,
            NORMAL: 1,
            TEXCOORD_0: 2,
          },
          indices: 3,
          material: 0,
        },
        {
          attributes: {
            POSITION: 0,
            NORMAL: 1,
            TEXCOORD_0: 2,
          },
          indices: 3,
          material: 1,
        },
      ],
    },
  ],
  textures: [
    {
      sampler: 0,
      source: 0,
    },
  ],
  images: [
    {
      uri: "",
    },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: 4,
      max: [0.5, 0.5, 0],
      min: [-0.5, -0.5, 0],
      type: "VEC3",
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: 4,
      type: "VEC3",
    },
    {
      bufferView: 2,
      componentType: 5126,
      count: 4,
      type: "VEC2",
    },
    {
      bufferView: 3,
      componentType: 5123,
      count: 6,
      type: "SCALAR",
    },
  ],
  bufferViews: [
    {
      buffer: 0,
      byteLength: 48,
      byteOffset: 0,
    },
    {
      buffer: 0,
      byteLength: 48,
      byteOffset: 48,
    },
    {
      buffer: 0,
      byteLength: 32,
      byteOffset: 96,
    },
    {
      buffer: 0,
      byteLength: 12,
      byteOffset: 128,
    },
  ],
  samplers: [
    {
      magFilter: 9729,
      minFilter: 9987,
      wrapS: 33648, // MIRRORED_REPEAT
      wrapT: 33648, // MIRRORED_REPEAT
    },
  ],
  buffers: [
    {
      byteLength: 140,
      uri: "data:application/octet-stream;base64,AAAAPwAAAAAAAAA/AAAAvwAAAAAAAAA/AAAAPwAAAAAAAAC/AAAAvwAAAAAAAAC/AAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAABAQAAAAAAAAIBAAAAAAAAAQEAAAIA/AACAQAAAgD8AAAEAAgADAAIAAQA=",
    },
  ],
};

export default {
  box,
  plane,
};
