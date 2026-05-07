import type {
  CategoryComputed,
  CategoryQuery,
  RequireKeys,
} from "@recipes/shared";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
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
    const pipeline = [
      stages.lookup({
        from: recipesCollectionName,
        localField: "_id",
        foreignField: "category",
        as: "recipes",
      }),
      stages.addFields({ recipeCount: { $size: "$recipes" } }),
      stages.project({ recipes: 0 }),
      stages.paginated({
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      }),
    ].flat();

    const result =
      await this.aggregate<
        PaginatedStageResult<CategoryDocument & CategoryComputed>
      >(pipeline);

    return extractPaginatedResult(result);
  }
}
