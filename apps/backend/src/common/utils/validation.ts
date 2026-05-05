import type { Model, Types } from "mongoose";
import { isObjectIdOrHexString } from "mongoose";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { BaseRepository } from "../base.repository.js";

type NoSubstring<S extends string, Forbidden extends string> =
  Lowercase<S> extends `${string}${Lowercase<Forbidden>}${string}`
    ? `Label "${S}" must not contain "${Forbidden}"`
    : S;

/**
 * Asserts that a given ID is a valid ObjectId
 *
 * @param id - ID to validate
 * @param label - Name of the entity being validated
 * @throws {BadRequestError} if the ID is not a valid ObjectId
 */
export function assertValidId<const T extends string>(
  id: string,
  label: NoSubstring<T, "id">,
): void {
  if (!isObjectIdOrHexString(id)) {
    throw new BadRequestError(`Invalid ${label} ID: ${id}`);
  }
}

/**
 * Asserts that a given ID exists in a given model
 *
 * @param model - Model to check
 * @param id - ID to check
 * @throws {NotFoundError} if the ID does not exist in the model
 */
export async function assertExists<T extends { _id: Types.ObjectId }>(
  model: Model<unknown> | Pick<BaseRepository<T>, "exists" | "modelName">,
  id: string,
): Promise<void> {
  const exists = await model.exists({ _id: id });
  if (!exists) {
    throw new NotFoundError(`${model.modelName} not found`);
  }
}
