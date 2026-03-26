export * from "./auth.schema.js";
export * from "./category.schema.js";
export * from "./recipe.schema.js";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type RenameField<T extends object, K extends keyof T, N extends PropertyKey> = Omit<T, K> &
  Record<N, T[K]>;

export function renameField<T extends object, K extends keyof T, N extends PropertyKey>(
  obj: T,
  oldName: K,
  newName: N,
) {
  const { [oldName]: value, ...rest } = obj;
  return {
    ...rest,
    [newName]: value,
  } as RenameField<T, K, N>;
}

export type OmitField<T extends object, K extends keyof T> = Omit<T, K>;

export function omitField<T extends object, K extends keyof T>(obj: T, name: K): OmitField<T, K> {
  const { [name]: _, ...rest } = obj;
  return rest as OmitField<T, K>;
}
