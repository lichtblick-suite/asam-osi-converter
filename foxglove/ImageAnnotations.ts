// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.14.0
// source: foxglove/ImageAnnotations.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { CircleAnnotation } from "./CircleAnnotation";
import { PointsAnnotation } from "./PointsAnnotation";
import { TextAnnotation } from "./TextAnnotation";

export const protobufPackage = "foxglove";

/** Array of annotations for a 2D image */
export interface ImageAnnotations {
  /** Circle annotations */
  circles: CircleAnnotation[];
  /** Points annotations */
  points: PointsAnnotation[];
  /** Text annotations */
  texts: TextAnnotation[];
}

function createBaseImageAnnotations(): ImageAnnotations {
  return { circles: [], points: [], texts: [] };
}

export const ImageAnnotations: MessageFns<ImageAnnotations> = {
  encode(message: ImageAnnotations, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.circles) {
      CircleAnnotation.encode(v!, writer.uint32(10).fork()).join();
    }
    for (const v of message.points) {
      PointsAnnotation.encode(v!, writer.uint32(18).fork()).join();
    }
    for (const v of message.texts) {
      TextAnnotation.encode(v!, writer.uint32(26).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): ImageAnnotations {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseImageAnnotations();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.circles.push(CircleAnnotation.decode(reader, reader.uint32()));
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.points.push(PointsAnnotation.decode(reader, reader.uint32()));
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.texts.push(TextAnnotation.decode(reader, reader.uint32()));
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

  fromJSON(object: any): ImageAnnotations {
    return {
      circles: globalThis.Array.isArray(object?.circles)
        ? object.circles.map((e: any) => CircleAnnotation.fromJSON(e))
        : [],
      points: globalThis.Array.isArray(object?.points)
        ? object.points.map((e: any) => PointsAnnotation.fromJSON(e))
        : [],
      texts: globalThis.Array.isArray(object?.texts) ? object.texts.map((e: any) => TextAnnotation.fromJSON(e)) : [],
    };
  },

  toJSON(message: ImageAnnotations): unknown {
    const obj: any = {};
    if (message.circles?.length) {
      obj.circles = message.circles.map((e) => CircleAnnotation.toJSON(e));
    }
    if (message.points?.length) {
      obj.points = message.points.map((e) => PointsAnnotation.toJSON(e));
    }
    if (message.texts?.length) {
      obj.texts = message.texts.map((e) => TextAnnotation.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ImageAnnotations>, I>>(base?: I): ImageAnnotations {
    return ImageAnnotations.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ImageAnnotations>, I>>(object: I): ImageAnnotations {
    const message = createBaseImageAnnotations();
    message.circles = object.circles?.map((e) => CircleAnnotation.fromPartial(e)) || [];
    message.points = object.points?.map((e) => PointsAnnotation.fromPartial(e)) || [];
    message.texts = object.texts?.map((e) => TextAnnotation.fromPartial(e)) || [];
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

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
