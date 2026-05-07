import type { OptionalInitiator } from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import stages from "@/common/utils/stages.js";
import { categoriesCollectionName } from "@/modules/categories/category.model.js";
import { favoritesCollectionName } from "@/modules/favorites/favorite.model.js";
import { recipeRatingsCollectionName } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { usersCollectionName } from "@/modules/users/user.model.js";

export function byVisibility({ id, role }: OptionalInitiator) {
  if (role === "admin") {
    return {};
  }

  if (id) {
    return {
      $or: [{ isPublic: true }, { author: toObjectId(id) }],
    };
  }

  return { isPublic: true };
}

export function withCategories() {
  return stages.lookup(
    {
      from: categoriesCollectionName,
      localField: "category",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
          },
        },
      ],
      as: "category",
    },
    { required: true },
  );
}

export function withAuthor() {
  return stages.lookup(
    {
      from: usersCollectionName,
      localField: "author",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
          },
        },
      ],
      as: "author",
    },
    { required: true },
  );
}

export function withFavorited(userId?: string) {
  if (!userId) {
    return [
      stages.addFields({
        isFavorited: false,
      }),
    ];
  }
  const userOid = toObjectId(userId);

  return [
    stages.lookup(
      {
        from: favoritesCollectionName,
        localField: "_id",
        foreignField: "recipe",
        pipeline: [
          stages.match({
            user: userOid,
          }),
          stages.project({
            _id: 0,
            user: 1,
          }),
        ],
        as: "favoritedBy",
      },
      { required: false },
    ),
    stages.addFields({
      isFavorited: {
        $eq: ["$favoritedBy.user", userOid],
      },
    }),
    stages.unset("favoritedBy"),
  ].flat();
}

export function withUserRating(userId?: string) {
  if (!userId) {
    return [
      stages.addFields({
        userRating: null,
      }),
    ];
  }

  return [
    stages.lookup(
      {
        from: recipeRatingsCollectionName,
        localField: "_id",
        foreignField: "recipe",
        pipeline: [
          stages.match({
            user: toObjectId(userId),
          }),
          stages.project({
            _id: 0,
            value: 1,
          }),
        ],
        as: "userRatingDoc",
      },
      { required: false },
    ),
    stages.addFields({
      userRating: "$userRatingDoc.value",
    }),
    stages.unset("userRatingDoc"),
  ].flat();
}

export function withAverageRating() {
  return [
    stages.lookup(
      {
        from: recipeRatingsCollectionName,
        localField: "_id",
        foreignField: "recipe",
        pipeline: [
          stages.group({
            _id: null,
            avg: { $avg: "$value" },
            count: { $sum: 1 },
          }),
          stages.project({
            _id: 0,
            avg: { $round: ["$avg", 1] },
            count: 1,
          }),
        ],
        as: "ratingStats",
      },
      { required: false },
    ),
    stages.addFields({
      averageRating: "$ratingStats.avg",
      ratingCount: { $ifNull: ["$ratingStats.count", 0] },
    }),
    stages.unset("ratingStats"),
  ].flat();
}
