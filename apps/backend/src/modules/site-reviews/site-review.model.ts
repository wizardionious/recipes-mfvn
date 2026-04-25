import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";

export interface SiteReviewDocument extends BaseDocument {
  author: Types.ObjectId;
  text: string;
  rating: number;
}

export interface SiteReviewModelType extends Model<SiteReviewDocument> {}

const siteReviewSchema = new Schema<SiteReviewDocument, SiteReviewModelType>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
    rating: {
      type: Schema.Types.Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    collection: "siteReviews",
    timestamps: { createdAt: true, updatedAt: true },
  },
);

siteReviewSchema.index(
  {
    author: 1,
  },
  { unique: true },
);

export const SiteReviewModel = model<SiteReviewDocument, SiteReviewModelType>(
  "SiteReview",
  siteReviewSchema,
);

export const siteReviewCollectionName = SiteReviewModel.collection.name;
