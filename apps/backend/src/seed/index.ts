import "dotenv/config";
import type { Minutes } from "@recipes/shared";
import { hashSync } from "bcryptjs";
import { logger } from "@/common/logger.js";
import { toObjectId } from "@/common/utils/mongo.js";
import { connectDatabase, disconnectDatabase } from "@/config/database.js";
import { env } from "@/config/env.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { ReviewModel } from "@/modules/reviews/review.model.js";
import { UserModel } from "@/modules/users/user.model.js";
import {
  seedCategories,
  seedComments,
  seedFavorites,
  seedRatings,
  seedRecipes,
  seedReviews,
  seedUsers,
} from "./data.js";

const shouldClear = process.argv.slice(2).includes("--clear");

async function clearDatabase(): Promise<void> {
  logger.info("Clearing database collections...");
  // Delete in reverse dependency order
  await ReviewModel.deleteMany({});
  await CommentModel.deleteMany({});
  await FavoriteModel.deleteMany({});
  await RecipeRatingModel.deleteMany({});
  await RecipeModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await UserModel.deleteMany({});
  logger.info("All collections cleared");
}

async function seed(): Promise<void> {
  await connectDatabase(logger);

  if (shouldClear) {
    await clearDatabase();
  }

  logger.info("Starting seed...");

  // Create categories
  const categoryMap = new Map<string, string>();
  for (const category of seedCategories) {
    const existing = await CategoryModel.findOne({ name: category.name });
    if (existing) {
      logger.warn({ name: category.name }, "Category already exists, skipping");
      categoryMap.set(category.name, existing._id.toString());
      continue;
    }
    const created = await CategoryModel.create(category);
    categoryMap.set(category.name, created._id.toString());
    logger.info({ name: category.name }, "Category created");
  }

  // Create users
  const userMap = new Map<string, string>();
  for (const user of seedUsers) {
    const existing = await UserModel.findOne({ email: user.email });
    if (existing) {
      logger.warn({ email: user.email }, "User already exists, skipping");
      userMap.set(user.email, existing._id.toString());
      continue;
    }
    const hashedPassword = hashSync(user.password, env.BCRYPT_SALT_ROUNDS);
    const created = await UserModel.create({
      ...user,
      password: hashedPassword,
    });
    userMap.set(user.email, created._id.toString());
    logger.info({ email: user.email }, "User created");
  }

  // Create recipes
  const recipeMap = new Map<string, string>();
  for (const recipe of seedRecipes) {
    const existing = await RecipeModel.findOne({ title: recipe.title });
    if (existing) {
      logger.warn({ title: recipe.title }, "Recipe already exists, skipping");
      recipeMap.set(recipe.title, existing._id.toString());
      continue;
    }
    const categoryId = categoryMap.get(recipe.categoryName);
    const authorId = userMap.get(recipe.authorEmail);
    if (!categoryId || !authorId) {
      logger.error(
        {
          title: recipe.title,
          category: recipe.categoryName,
          author: recipe.authorEmail,
        },
        "Missing category or author for recipe, skipping",
      );
      continue;
    }
    const created = await RecipeModel.create({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: toObjectId(categoryId),
      author: toObjectId(authorId),
      difficulty: recipe.difficulty,
      cookingTime: recipe.cookingTime as Minutes,
      servings: recipe.servings,
      isPublic: recipe.isPublic,
    });
    recipeMap.set(recipe.title, created._id.toString());
    logger.info({ title: recipe.title }, "Recipe created");
  }

  // Create comments
  let commentsCreated = 0;
  for (const comment of seedComments) {
    const recipeId = recipeMap.get(comment.recipeTitle);
    const authorId = userMap.get(comment.authorEmail);
    if (!recipeId || !authorId) {
      logger.error(
        { recipe: comment.recipeTitle, author: comment.authorEmail },
        "Missing recipe or author for comment, skipping",
      );
      continue;
    }
    const existing = await CommentModel.findOne({
      text: comment.text,
      recipe: recipeId,
      author: authorId,
    });
    if (existing) {
      continue;
    }
    await CommentModel.create({
      text: comment.text,
      recipe: recipeId,
      author: authorId,
    });
    commentsCreated++;
  }
  logger.info({ count: commentsCreated }, "Comments created");

  // Create ratings
  let ratingsCreated = 0;
  for (const rating of seedRatings) {
    const recipeId = recipeMap.get(rating.recipeTitle);
    const userId = userMap.get(rating.userEmail);
    if (!recipeId || !userId) {
      logger.error(
        { recipe: rating.recipeTitle, user: rating.userEmail },
        "Missing recipe or user for rating, skipping",
      );
      continue;
    }
    const existing = await RecipeRatingModel.findOne({
      user: userId,
      recipe: recipeId,
    });
    if (existing) {
      continue;
    }
    await RecipeRatingModel.create({
      user: userId,
      recipe: recipeId,
      value: rating.value,
    });
    ratingsCreated++;
  }
  logger.info({ count: ratingsCreated }, "Ratings created");

  // Create favorites
  let favoritesCreated = 0;
  for (const favorite of seedFavorites) {
    const userId = userMap.get(favorite.userEmail);
    const recipeId = recipeMap.get(favorite.recipeTitle);
    if (!userId || !recipeId) {
      logger.error(
        { user: favorite.userEmail, recipe: favorite.recipeTitle },
        "Missing user or recipe for favorite, skipping",
      );
      continue;
    }
    const existing = await FavoriteModel.findOne({
      user: userId,
      recipe: recipeId,
    });
    if (existing) {
      continue;
    }
    await FavoriteModel.create({
      user: userId,
      recipe: recipeId,
    });
    favoritesCreated++;
  }
  logger.info({ count: favoritesCreated }, "Favorites created");

  // Create reviews
  let reviewsCreated = 0;
  for (const review of seedReviews) {
    const authorId = userMap.get(review.authorEmail);
    if (!authorId) {
      logger.error(
        { author: review.authorEmail },
        "Missing author for review, skipping",
      );
      continue;
    }
    const existing = await ReviewModel.findOne({ author: authorId });
    if (existing) {
      continue;
    }
    await ReviewModel.create({
      author: authorId,
      text: review.text,
      rating: review.rating,
      isFeatured: review.isFeatured,
    });
    reviewsCreated++;
  }
  logger.info({ count: reviewsCreated }, "Reviews created");

  logger.info("Seed completed successfully");
}

async function main(): Promise<void> {
  try {
    await seed();
  } catch (err) {
    logger.error(err, "Seed failed");
    process.exitCode = 1;
  } finally {
    await disconnectDatabase(logger);
  }
}

main().then(() => process.exit());
