export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// biome-ignore lint/complexity/noBannedTypes: default empty object type
export type EmptyObject = {};

/**
 * @deprecated Use `Merge` instead.
 */
export type Replace<T, R extends Record<PropertyKey, unknown>> = Omit<
  T,
  keyof R
> &
  R;

/**
 * Merges two objects of the same type.
 *
 * @param T - The type of the original object.
 * @param R - The type of the object to merge.
 * @returns An object of type `T` with the properties of `R` merged in.
 *
 * @example
 * type A = { a: number; b: string };
 * type B = { b: number; c: string };
 * type C = Merge<A, B>; // { a: number; b: number; c: string; }
 */
export type Merge<T, R extends Record<PropertyKey, unknown>> = Omit<
  T,
  keyof R
> &
  R;

export type OptionalKeys<T, K extends keyof T> = Prettify<
  Omit<T, K> & Partial<Pick<T, K>>
>;

export type RequireKeys<T, K extends keyof T> = Prettify<
  Omit<T, K> & Required<Pick<T, K>>
>;
