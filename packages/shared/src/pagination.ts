import { z } from "zod";

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function withPagination<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    items: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });
}
