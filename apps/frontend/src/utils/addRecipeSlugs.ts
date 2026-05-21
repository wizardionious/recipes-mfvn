import type { RecipeWithComputed } from '@recipes/shared';
import { createSlug } from '@/utils/createSlug';

export type RecipeInput = Omit<RecipeWithComputed, 'slug'> & {
  slug?: string;
};

export function addRecipeSlugs(recipes: RecipeInput[]): RecipeWithComputed[] {
  const usedSlugs = new Set<string>();

  return recipes.map((recipe) => {
    const baseSlug = recipe.slug?.trim()
      ? createSlug(recipe.slug)
      : createSlug(recipe.title);

    let finalSlug = baseSlug || recipe.id;

    if (usedSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${recipe.id}`;
    }

    usedSlugs.add(finalSlug);

    return {
      ...recipe,
      slug: finalSlug,
    };
  });
}