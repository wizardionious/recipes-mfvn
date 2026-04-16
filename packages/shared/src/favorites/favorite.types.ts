import type { z } from "zod";
import type { favoriteQuerySchema } from "./favorite.schema.js";

export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>;
