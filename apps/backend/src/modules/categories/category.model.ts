import type { SearchCategoryQuery } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { withSort } from "@/common/utils/mongoose.aggregation.js";

export interface CategoryDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryDocumentWithCount extends CategoryDocument {
  recipeCount: number;
}

export interface CategoryModelType extends Model<CategoryDocument> {
  searchFull(
    query: SearchCategoryQuery,
    withCount?: boolean,
  ): Promise<CategoryDocumentWithCount[]>;
}

const categorySchema = new Schema<CategoryDocument, CategoryModelType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

categorySchema.pre("validate", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }
});

categorySchema.statics.searchFull = async function (
  query: SearchCategoryQuery,
  withCount: boolean = true,
): Promise<CategoryDocumentWithCount[]> {
  const result = await this.aggregate<CategoryDocumentWithCount>([
    ...(withCount
      ? [
          {
            $lookup: {
              from: "recipes",
              localField: "_id",
              foreignField: "category",
              as: "recipes",
            },
          },
          { $addFields: { recipeCount: { $size: "$recipes" } } },
          { $project: { recipes: 0 } },
        ]
      : []),
    ...withSort(query.sort),
  ]);

  return result;
};

export const CATEGORY_MODEL_NAME = "Category";
export const CategoryModel = model<CategoryDocument, CategoryModelType>(
  CATEGORY_MODEL_NAME,
  categorySchema,
);
