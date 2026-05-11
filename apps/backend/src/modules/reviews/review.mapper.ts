import type { Review } from "@recipes/shared";

export type ReviewView = {
  _id: string | { toString(): string };
  text: string;
  rating: number;
  author: {
    _id: string | { toString(): string };
    email: string;
    name: string;
  };
  isFeatured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toReview(view: ReviewView): Review {
  return {
    id: view._id.toString(),
    text: view.text,
    rating: view.rating,
    author: {
      id: view.author._id.toString(),
      email: view.author.email,
      name: view.author.name,
    },
    isFeatured: view.isFeatured,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
