import type { Merge } from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { UserDocument } from "@/modules/users/user.model.js";

export interface ReviewDocument extends BaseDocument {
  author: Types.ObjectId;
  text: string;
  rating: number;
  isFeatured: boolean;
}

export interface ReviewDocumentPopulated
  extends Merge<
    ReviewDocument,
    { author: Pick<UserDocument, "_id" | "name" | "email"> }
  > {}

export type ReviewModelType = Model<ReviewDocument>;

const reviewSchema = new Schema<ReviewDocument, ReviewModelType>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ author: 1 }, { unique: true });

export const ReviewModel = model<ReviewDocument, ReviewModelType>(
  "Review",
  reviewSchema,
);

export const reviewsCollectionName = ReviewModel.collection.name;
