import type { RecipeRatingBody } from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";
import type { RecipeRatingRepository } from "./recipe-rating.repository.js";

export interface RecipeRatingService {
  rate(
    recipeId: string,
    params: CreateMethodParams<RecipeRatingBody>,
  ): Promise<{ value: number }>;
  remove(recipeId: string, params: DeleteMethodParams): Promise<void>;
}

export function createRecipeRatingService(
  repository: RecipeRatingRepository,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  bus: TypedEmitter,
): RecipeRatingService {
  async function validateUser(userId: string): Promise<void> {
    assertValidId(userId, "User");
    await assertExists(userModel, userId);
  }

  async function validateRecipe(recipeId: string): Promise<void> {
    assertValidId(recipeId, "Recipe");
    await assertExists(recipeModel, recipeId);
  }

  return {
    rate: async (recipeId, { data, initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      const rating = await repository.upsert(
        { user: initiator.id, recipe: recipeId },
        data.value,
      );

      bus.emit("recipe:rated", recipeId);

      return { value: rating.value };
    },

    remove: async (recipeId, { initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      const result = await repository.delete({
        user: initiator.id,
        recipe: recipeId,
      });

      if (!result) {
        throw new NotFoundError(
          `Rating for ${recipeId} by ${initiator.id} not found`,
        );
      }

      bus.emit("recipe:rated", recipeId);
    },
  };
}
