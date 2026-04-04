import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";

export interface CategoryDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
}

const categorySchema = new Schema<CategoryDocument>(
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

export const CATEGORY_MODEL_NAME = "Category";
export const CategoryModel = model<CategoryDocument>(
  CATEGORY_MODEL_NAME,
  categorySchema,
);
