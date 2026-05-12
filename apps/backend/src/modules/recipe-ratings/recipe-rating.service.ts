import type { RecipeRatingBody } from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import type { RecipeRatingRepository } from "./recipe-rating.repository.js";

export interface RecipeRatingService {
  rate(
    recipeId: string,
    params: CreateMethodParams<RecipeRatingBody>,
  ): Promise<{ value: number }>;
  remove(recipeId: string, params: DeleteMethodParams): Promise<void>;
}

type RecipeRatingRepositoryPort = Pick<
  RecipeRatingRepository,
  "upsert" | "delete"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "exists" | "modelName">;
type UserRepositoryPort = Pick<UserRepository, "exists" | "modelName">;
type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createRecipeRatingService(
  repository: RecipeRatingRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  userRepository: UserRepositoryPort,
  bus: TypedEmitterPort,
): RecipeRatingService {
  async function validateUser(userId: string): Promise<void> {
    assertValidId(userId, "User");
    await assertExists(userRepository, userId);
  }

  async function validateRecipe(recipeId: string): Promise<void> {
    assertValidId(recipeId, "Recipe");
    await assertExists(recipeRepository, recipeId);
  }

  return {
    rate: async (recipeId, { data, initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      const { document: rating, oldDoc } = await repository.upsert(
        { user: initiator.id, recipe: recipeId },
        data.value,
      );

      if (oldDoc === null) {
        bus.emit("recipe-rating:created", {
          recipeId,
          userId: initiator.id,
          value: rating.value,
        });
      } else {
        bus.emit("recipe-rating:updated", {
          recipeId,
          userId: initiator.id,
          previousValue: oldDoc.value,
          value: rating.value,
        });
      }

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

      bus.emit("recipe-rating:deleted", {
        recipeId,
        userId: initiator.id,
        value: result.value,
      });
    },
  };
}
