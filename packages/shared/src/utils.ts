export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Replace<T, R extends Record<PropertyKey, unknown>> = Omit<
  T,
  keyof R
> &
  R;

export type PartialKeys<T, K extends keyof T> = Prettify<
  Omit<T, K> & Partial<Pick<T, K>>
>;

export type RequireKeys<T, K extends keyof T> = Prettify<
  Omit<T, K> & Required<Pick<T, K>>
>;

export type RenameField<
  T extends object,
  K extends keyof T,
  N extends PropertyKey,
> = Omit<T, K> & Record<N, T[K]>;

export function renameField<
  T extends object,
  K extends keyof T,
  N extends PropertyKey,
>(obj: T, oldName: K, newName: N) {
  const { [oldName]: value, ...rest } = obj;
  return {
    ...rest,
    [newName]: value,
  } as RenameField<T, K, N>;
}

export type OmitField<T extends object, K extends keyof T> = Omit<T, K>;

export function omitField<T extends object, K extends keyof T>(
  obj: T,
  name: K,
): OmitField<T, K> {
  const { [name]: _, ...rest } = obj;
  return rest as OmitField<T, K>;
}
