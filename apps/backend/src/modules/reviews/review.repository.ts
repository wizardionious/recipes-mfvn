import type { RequireKeys, ReviewQuery } from "@recipes/shared";
import type { QueryFilter } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { QueryMethodParams } from "@/common/types/methods.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
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
    const pipeline = [
      stages.match<ReviewDocument>({ isFeatured: true }),
      stages.unset<ReviewDocument>("__v"),
      withAuthor(),
      stages.sort("-createdAt"),
      stages.limit(limit),
    ].flat();

    const result = await this.aggregate<ReviewDocumentPopulated>(pipeline);

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

    const pipeline = [
      stages.match(match),
      stages.unset<ReviewDocument>("__v"),
      withAuthor(),
      stages.paginated({
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      }),
    ].flat();

    const result =
      await this.aggregate<PaginatedStageResult<ReviewDocumentPopulated>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }

  async aggregateStats(): Promise<ReviewStats> {
    const result = await this.aggregate<ReviewStats>([
      stages.group({
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        happyCooksCount: {
          $sum: stages.cond({ $gte: ["$rating", 4] }, 1, 0),
        },
      }),
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

function withAuthor() {
  return stages.lookup(
    {
      from: usersCollectionName,
      localField: "author",
      foreignField: "_id",
      pipeline: [
        stages.project({
          _id: 1,
          name: 1,
          email: 1,
        }),
      ],
      as: "author",
    },
    {
      required: true,
    },
  );
}
