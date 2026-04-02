import type { QueryFilter } from "mongoose";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { SearchRecipeQuery } from "@/modules/recipes/recipe.schema.js";

export function buildRecipeFilter(
  query: SearchRecipeQuery,
): QueryFilter<IRecipeDocument> {
  const { categoryId, difficulty, search } = query;
  const filter: QueryFilter<IRecipeDocument> = {};

  if (categoryId) {
    filter.category = categoryId;
  }
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
}

export function withVisibilityFilter(
  filter: QueryFilter<IRecipeDocument>,
  userId?: string,
): QueryFilter<IRecipeDocument> {
  if (!userId) {
    filter.isPublic = true;
  } else {
    filter.$or = [{ isPublic: true }, { author: userId }];
  }

  return filter;
}
