import type {
  CategoryComputed,
  CategoryQuery,
  RequireKeys,
} from "@recipes/shared";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  extractTotalCountResult,
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { CategoryDocument } from "./category.model.js";

export type CategoryCreateInput = RequireKeys<
  CreateInput<CategoryDocument>,
  "name"
>;
export type CategoryUpdateInput = UpdateInput<CategoryDocument>;

export class CategoryRepository extends BaseRepository<
  CategoryDocument,
  CategoryCreateInput,
  CategoryUpdateInput
> {
  async findMany(
    query: CategoryQuery,
  ): Promise<[Array<CategoryDocument & CategoryComputed>, number]> {
    const result = await this.aggregate<
      WithTotalCountResult<CategoryDocument & CategoryComputed>
    >([
      {
        $lookup: {
          from: recipesCollectionName,
          localField: "_id",
          foreignField: "category",
          as: "recipes",
        },
      },
      { $addFields: { recipeCount: { $size: "$recipes" } } },
      { $project: { recipes: 0 } },
      ...withTotalCount(
        ...withSort(query.sort),
        ...withPagination(query.page, query.limit),
      ),
    ]);

    return extractTotalCountResult(result);
  }
}
