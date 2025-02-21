// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.14.0
// source: foxglove/Point3.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "foxglove";

/** A point representing a position in 3D space */
export interface Point3 {
  /** x coordinate position */
  x: number;
  /** y coordinate position */
  y: number;
  /** z coordinate position */
  z: number;
}

function createBasePoint3(): Point3 {
  return { x: 0, y: 0, z: 0 };
}

export const Point3: MessageFns<Point3> = {
  encode(message: Point3, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.x !== 0) {
      writer.uint32(9).double(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(17).double(message.y);
    }
    if (message.z !== 0) {
      writer.uint32(25).double(message.z);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Point3 {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoint3();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 9) {
            break;
          }

          message.x = reader.double();
          continue;
        }
        case 2: {
          if (tag !== 17) {
            break;
          }

          message.y = reader.double();
          continue;
        }
        case 3: {
          if (tag !== 25) {
            break;
          }

          message.z = reader.double();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Point3 {
    return {
      x: isSet(object.x) ? globalThis.Number(object.x) : 0,
      y: isSet(object.y) ? globalThis.Number(object.y) : 0,
      z: isSet(object.z) ? globalThis.Number(object.z) : 0,
    };
  },

  toJSON(message: Point3): unknown {
    const obj: any = {};
    if (message.x !== 0) {
      obj.x = message.x;
    }
    if (message.y !== 0) {
      obj.y = message.y;
    }
    if (message.z !== 0) {
      obj.z = message.z;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Point3>, I>>(base?: I): Point3 {
    return Point3.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Point3>, I>>(object: I): Point3 {
    const message = createBasePoint3();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    message.z = object.z ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
