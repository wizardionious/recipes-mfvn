import type { RequireKeys } from "@recipes/shared";
import type { QueryFilter } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { RecipeRatingDocument } from "./recipe-rating.model.js";

export type RecipeRatingCreateInput = RequireKeys<
  CreateInput<RecipeRatingDocument>,
  "user" | "recipe" | "value"
>;
export type RecipeRatingUpdateInput = UpdateInput<RecipeRatingDocument>;

export class RecipeRatingRepository extends BaseRepository<
  RecipeRatingDocument,
  RecipeRatingCreateInput,
  RecipeRatingUpdateInput
> {
  async upsert(
    filter: QueryFilter<RecipeRatingDocument>,
    value: number,
  ): Promise<{
    document: RecipeRatingDocument;
    oldDoc: RecipeRatingDocument | null;
  }> {
    const oldDoc = await this.findOne(filter);

    const document = await this.model
      .findOneAndUpdate(filter, this.castInput({ value }), {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      })
      .lean();

    return {
      document,
      oldDoc,
    };
  }
}
