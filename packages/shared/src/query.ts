import { z } from "zod";

/**
 * Extracts the sort name and sort order from a sort string.
 *
 * @param sort - The sort string.
 * @returns An array containing the sort name and sort order.
 *
 * @example
 * getSortDetails("name"); // ["name", 1]
 * getSortDetails("-name"); // ["name", -1]
 */
export function getSortDetails<const T extends string>(sort: T): [T, 1 | -1] {
  const desc = sort.startsWith("-");
  const sortName = desc ? (sort.slice(1) as T) : sort;
  const sortOrder = desc ? -1 : 1;

  return [sortName, sortOrder];
}

/**
 * Converts a sort string to a MongoDB compatible sort object.
 *
 * @param sort - The sort string.
 * @returns A MongoDB sort object.
 *
 * @example
 * getSortObject("name"); // { name: 1 }
 * getSortObject("-name"); // { name: -1 }
 */
export function getSortObject<const T extends string>(sort: T) {
  const [name, order] = getSortDetails(sort);

  return { [name]: order };
}

/**
 * Creates a Zod schema for sorting by a given list of fields.
 *
 * @param fields - The list of fields to sort by.
 * @returns A Zod schema for sorting by the given fields.
 *
 * @example
 * createSortSchema(["name", "createdAt"]); // z.enum(["name", "createdAt", "-name", "-createdAt"])
 */
export function createSortSchema<const T extends string>(
  fields: readonly [T, ...T[]],
) {
  const variants = fields.flatMap((f) => [f, `-${f}`] as const);
  return z.enum(variants);
}
