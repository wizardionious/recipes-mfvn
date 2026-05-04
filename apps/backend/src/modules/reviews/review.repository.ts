import type { RequireKeys, ReviewQuery } from "@recipes/shared";
import type { PipelineStage, QueryFilter } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { QueryMethodParams } from "@/common/types/methods.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  extractTotalCountResult,
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { UserDocument } from "@/modules/users/user.model.js";
import { usersCollectionName } from "@/modules/users/user.model.js";
import type {
  ReviewDocument,
  ReviewDocumentPopulated,
} from "./review.model.js";

export type ReviewCreateInput = RequireKeys<
  CreateInput<ReviewDocument>,
  "author" | "text" | "rating"
>;
export type ReviewUpdateInput = UpdateInput<ReviewDocument>;

export type ReviewStats = {
  totalReviews: number;
  averageRating: number;
  happyCooksCount: number;
};

export type ReviewDefaultPopulate = {
  author: Pick<UserDocument, "_id" | "name" | "email">;
};

export class ReviewRepository extends BaseRepository<
  ReviewDocument,
  ReviewCreateInput,
  ReviewUpdateInput,
  ReviewDefaultPopulate
> {
  async findFeatured(limit: number): Promise<ReviewDocumentPopulated[]> {
    const result = await this.aggregate<ReviewDocumentPopulated>([
      {
        $match: { isFeatured: true },
      },
      { $unset: "__v" },
      ...withAuthor(),
      ...withSort("-createdAt"),
      { $limit: limit },
    ]);

    return result;
  }

  async findAll({
    query,
  }: QueryMethodParams<ReviewQuery>): Promise<
    [ReviewDocumentPopulated[], number]
  > {
    const match: QueryFilter<ReviewDocument> = {};
    if (query.isFeatured !== undefined) {
      match.isFeatured = query.isFeatured;
    }

    const result = await this.aggregate<
      WithTotalCountResult<ReviewDocumentPopulated>
    >([
      { $match: match },
      { $unset: "__v" },
      ...withAuthor(),
      ...withTotalCount(
        ...withSort(query.sort),
        ...withPagination(query.page, query.limit),
      ),
    ]);

    return extractTotalCountResult(result);
  }

  async aggregateStats(): Promise<ReviewStats> {
    const result = await this.aggregate<ReviewStats>([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          happyCooksCount: {
            $sum: {
              $cond: [{ $gte: ["$rating", 4] }, 1, 0],
            },
          },
        },
      },
    ]);

    const [stats] = result;
    if (!stats) {
      return { totalReviews: 0, averageRating: 0, happyCooksCount: 0 };
    }

    return {
      totalReviews: stats.totalReviews,
      averageRating: Number(stats.averageRating.toFixed(1)),
      happyCooksCount: stats.happyCooksCount,
    };
  }

  protected override getDefaultPopulate() {
    return { path: "author", select: "_id name email" };
  }
}

function withAuthor(): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
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
    },
    { $unwind: { path: "$author" } },
  ];
}
