import type { Types } from "mongoose";

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocumentWithoutUpdate {
  _id: Types.ObjectId;
  createdAt: Date;
}

export type RefValue = Types.ObjectId | readonly Types.ObjectId[];

/**
 * Extracts the keys of a type that are not `_id` and are of type `RefValue`.
 */
export type RefKeys<T> = {
  [K in keyof T]-?: K extends "_id"
    ? never
    : NonNullable<T[K]> extends RefValue
      ? K
      : never;
}[keyof T];

/**
 * Returns a type with only the keys of `T` that are not `_id` and are of type `RefValue`.
 */
export type RefsOnly<T> = Pick<T, RefKeys<T>>;
