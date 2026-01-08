/* export type ProtoNormalized<T> =
  // Leave functions untouched
  T extends (...args: unknown[]) => unknown
    ? T
    : // Repeated fields: always present, recurse into element
      T extends readonly (infer U)[]
      ? ProtoNormalized<U>[]
      : T extends (infer U)[]
        ? ProtoNormalized<U>[]
        : // Objects (protobuf messages)
          T extends object
          ? {
              [K in keyof T]-?: NonNullable<T[K]> extends readonly (infer U)[] // Strip undefined from the field type first
                ? ProtoNormalized<U>[]
                : NonNullable<T[K]> extends (infer U)[]
                  ? ProtoNormalized<U>[]
                  : // Nested message → still optional at this level
                    NonNullable<T[K]> extends object
                    ? ProtoNormalized<NonNullable<T[K]>> | undefined
                    : // Scalars & enums → always present
                      NonNullable<T[K]>;
            }
          : // Scalars
            T; */

type Split<S extends string> = S extends `${infer H}.${infer T}` ? [H, ...Split<T>] : [S];

type UnionToIntersection<U> = (U extends unknown ? (x: U) => unknown : never) extends (
  x: infer I,
) => unknown
  ? I
  : never;

type RequirePath<T, Parts extends readonly string[]> = Parts extends [infer H, ...infer R]
  ? H extends keyof T
    ? Omit<T, H> & {
        [K in H]-?: R extends []
          ? NonNullable<T[K]>
          : RequirePath<NonNullable<T[K]>, Extract<R, string[]>>;
      }
    : T
  : T;

type TrustPaths<T, Paths extends readonly string[]> = Paths[number] extends never
  ? T
  : UnionToIntersection<
      {
        [K in Paths[number]]: RequirePath<T, Split<K>>;
      }[Paths[number]]
    >;

export type Trusted<T, Paths extends readonly string[]> = TrustPaths<T, Paths>;

export const MINSET_OBJECT = [
  "id",
  "base.position",
  "base.dimension",
  "base.orientation",
  "type",
] as const;
