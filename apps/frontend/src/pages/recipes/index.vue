<script lang="ts" setup>
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import RecipeCard from "@/components/ui/RecipeCard.vue";
import { recipes } from "@/data/recipes";
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@lucide/vue";
import { normalizeSearchText } from "@/utils/normalizeSearchText";
import { getRecipeCategories } from "@/utils/getRecipeCategories";

defineOptions({
  name: "RecipesPage",
});

const route = useRoute();

const router = useRouter();
const localQuery = ref("");

type Recipe = (typeof recipes)[number];

const recipeCategories = computed(() => {
  return getRecipeCategories(recipes);
});

const searchQuery = computed(() => {
  return String(route.query.search ?? "").trim();
});

const normalizedSearchQuery = computed(() => {
  return normalizeSearchText(searchQuery.value);
});

const categoryQuery = computed(() => {
  return String(route.query.category ?? "").trim();
});

const navigationCategoryLabels: Record<string, string> = {
  breakfasts: "Завтраки",
  lunches: "Обеды",
  dinners: "Ужины",
};

watch(
  searchQuery,
  (newSearchQuery) => {
    localQuery.value = newSearchQuery;
  },
  {
    immediate: true,
  },
);

async function goToRecipesCatalog(
  searchQuery: string,
  categorySlug = categoryQuery.value,
) {
  const normalizedQuery = searchQuery.trim();

  try {
    await router.push({
      path: "/recipes",
      query: {
        ...(normalizedQuery && { search: normalizedQuery }),
        ...(categorySlug && { category: categorySlug }),
      },
    });
  } catch (error) {
    console.error("Recipes catalog navigation failed:", error);
  }
}

async function submitSearch() {
  await goToRecipesCatalog(localQuery.value);
}

async function clearSearch() {
  localQuery.value = "";

  await goToRecipesCatalog("", "");
}

async function selectCategory(categorySlug: string) {
  const nextCategorySlug =
    categorySlug === categoryQuery.value ? "" : categorySlug;

  await goToRecipesCatalog(localQuery.value, nextCategorySlug);
}

function mapRecipeToCard(recipe: Recipe) {
  return {
    id: recipe.id,
    slug: recipe.slug,
    category: recipe.category.name,
    title: recipe.title,
    image: recipe.image.url,
    imageAlt: recipe.image.alt ?? recipe.title,
  };
}

const recipeCards = computed(() => {
  return recipes
    .filter((recipe) => {
      if (categoryQuery.value && recipe.category.slug !== categoryQuery.value) {
        return false;
      }

      if (!normalizedSearchQuery.value) {
        return true;
      }

      const searchableText = normalizeSearchText(
        [
          recipe.title,
          recipe.description,
          recipe.category.name,
          ...recipe.ingredients.map((ingredient) => ingredient.name),
        ].join(" "),
      );

      return searchableText.includes(normalizedSearchQuery.value);
    })
    .map(mapRecipeToCard);
});

function getRecipeWord(count: number) {
  const absoluteCount = Math.abs(count);
  const lastTwoDigits = absoluteCount % 100;
  const lastDigit = absoluteCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "рецептов";
  }

  if (lastDigit === 1) {
    return "рецепт";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "рецепта";
  }

  return "рецептов";
}

const resultCountText = computed(() => {
  const count = recipeCards.value.length;
  const recipeWord = getRecipeWord(count);

  if (!searchQuery.value && !categoryQuery.value) {
    return `Всего ${count} ${recipeWord}`;
  }

  if (recipeWord === "рецепт") {
    return `Найден ${count} ${recipeWord}`;
  }

  return `Найдено ${count} ${recipeWord}`;
});

const activeCategoryName = computed(() => {
  const activeCategory = recipeCategories.value.find((category) => {
    return category.slug === categoryQuery.value;
  });

  return (
    activeCategory?.name ?? navigationCategoryLabels[categoryQuery.value] ?? ""
  );
});

const emptyStateTitle = computed(() => {
  if (searchQuery.value && categoryQuery.value) {
    return "Ничего не найдено в этой категории";
  }

  if (categoryQuery.value) {
    return "В этой категории пока нет рецептов";
  }

  return "Ничего не найдено";
});

const suggestedSearchQueries = ["кофе", "хлеб", "свёкла", "клубника", "салат"];

async function searchBySuggestion(suggestedQuery: string) {
  localQuery.value = suggestedQuery;

  await goToRecipesCatalog(suggestedQuery);
}
</script>

<template>
  <DefaultLayout>
    <section class="recipes-page">
      <RouterLink
        to="/"
        class="recipes-page__back inline-flex items-center gap-2"
      >
        <ArrowLeft :size="16" aria-hidden="true" />На главную
      </RouterLink>

      <header class="recipes-page__header">
        <h1 class="recipes-page__title">
          {{ searchQuery ? "Поиск рецептов" : "Каталог рецептов" }}
        </h1>

        <p
          v-if="searchQuery && activeCategoryName"
          class="recipes-page__subtitle"
        >
          Результаты по запросу: <strong>«{{ searchQuery }}»</strong> в
          категории
          <strong>«{{ activeCategoryName }}»</strong>
        </p>

        <p v-else-if="searchQuery" class="recipes-page__subtitle">
          Результаты по запросу: <strong>«{{ searchQuery }}»</strong>
        </p>

        <p v-else-if="activeCategoryName" class="recipes-page__subtitle">
          Категория: <strong>«{{ activeCategoryName }}»</strong>
        </p>

        <p v-else class="recipes-page__subtitle">
          Ищите по названию, категории или ингредиенту.
        </p>
      </header>

      <form
        class="recipes-page__form"
        role="search"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="localQuery"
          class="recipes-page__input"
          type="search"
          placeholder="Например: кофе"
          aria-label="Поиск рецептов"
        />
        <div class="recipes-page__actions">
          <button class="recipes-page__button" type="submit">Найти</button>
          <button
            v-if="searchQuery"
            class="recipes-page__button recipes-page__button--secondary"
            type="button"
            @click="clearSearch"
          >
            Очистить
          </button>
        </div>
      </form>

      <div class="recipes-page__categories" aria-label="Фильтр категорий">
        <button
          type="button"
          class="recipes-page__category"
          :class="{ 'recipes-page__category--active': !categoryQuery }"
          @click="selectCategory('')"
        >
          Все
        </button>

        <button
          v-for="category in recipeCategories"
          :key="category.slug"
          type="button"
          class="recipes-page__category"
          :class="{
            'recipes-page__category--active': category.slug === categoryQuery,
          }"
          @click="selectCategory(category.slug)"
        >
          {{ category.name }}
        </button>
      </div>

      <p class="recipes-page__count" aria-live="polite">
        {{ resultCountText }}
      </p>

      <section v-if="recipeCards.length" class="recipes-page__results">
        <RecipeCard
          v-for="recipeCard in recipeCards"
          :key="recipeCard.id"
          :recipe="recipeCard"
        />
      </section>

      <section
        v-else-if="searchQuery || categoryQuery"
        class="recipes-page__empty"
      >
        <h2>{{ emptyStateTitle }}</h2>

        <p v-if="searchQuery && activeCategoryName">
          По запросу <strong>«{{ searchQuery }}»</strong> в категории
          <strong>«{{ activeCategoryName }}»</strong> ничего не найдено.
          Попробуй другой запрос или выбери другую категорию.
        </p>

        <p v-else-if="categoryQuery">
          В категории
          <strong>«{{ activeCategoryName || categoryQuery }}»</strong>
          пока нет рецептов. Можно выбрать другую категорию или посмотреть весь
          список.
        </p>

        <p v-else>Попробуй другой запрос или выбери одну из подсказок ниже.</p>

        <button
          v-if="categoryQuery"
          type="button"
          class="recipes-page__reset"
          @click="clearSearch"
        >
          Показать все рецепты
        </button>

        <div class="recipes-page__suggestions" aria-label="Подсказки поиска">
          <button
            v-for="suggestedQuery in suggestedSearchQueries"
            :key="suggestedQuery"
            type="button"
            class="recipes-page__suggestion"
            @click="searchBySuggestion(suggestedQuery)"
          >
            {{ suggestedQuery }}
          </button>
        </div>
      </section>
    </section>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.recipes-page {
  padding: 32px 16px 48px;
  background-color: var(--color-page-bg);
  color: var(--color-text-main);

  &__back {
    margin-bottom: 28px;
    color: var(--color-accent);
    font-weight: 700;
    text-decoration: none;
  }

  &__back:hover,
  &__back:focus-visible {
    color: var(--color-accent-strong);
  }

  &__header {
    max-width: 560px;
    margin: 0 auto 32px;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: clamp(28px, 6vw, 44px);
    line-height: 1.1;
  }

  &__subtitle {
    margin: 12px 0 0;
    color: var(--color-text-muted);
    font-size: 15px;
    line-height: 1.5;
  }

  &__subtitle strong,
  &__empty strong {
    color: var(--color-text-body);
    font-weight: 700;
  }

  &__count {
    margin: -12px auto 24px;
    color: var(--color-text-muted);
    font-size: 14px;
    text-align: center;
  }

  &__form {
    max-width: 560px;
    margin: 0 auto 32px;
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text-body);
    font-size: 16px;
  }

  &__input::placeholder {
    color: var(--color-text-muted);
  }

  &__input:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__button {
    height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-md);
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-weight: 700;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background-color: var(--color-accent-strong);
    }

    &:active {
      background-color: oklch(0.595 0.1367 3.86);
    }
  }

  &__button--secondary {
    border: 1px solid var(--color-border-soft);
    background-color: transparent;
    color: var(--color-text-body);
  }

  &__button--secondary:hover,
  &__button--secondary:focus-visible {
    border-color: var(--color-accent);
    background-color: transparent;
    color: var(--color-accent-strong);
  }

  &__categories {
    max-width: 560px;
    margin: -16px auto 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  &__category {
    padding: 8px 12px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    &:focus-visible,
    &:hover {
      background-color: oklch(0.915 0 0);
      /* border-color: var(--color-accent); */
      /* color: var(--color-surface); */
    }
    &:active {
      background-color: oklch(0.885 0 0);
    }
  }

  &__category--active {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-surface);

    &:hover,
    &:focus-visible,
    &:active {
      background-color: var(--color-accent-strong);
      border-color: var(--color-accent-strong);
      color: var(--color-surface);
    }
  }

  &__results {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: center;
    gap: 32px 24px;
    max-width: 760px;
    margin: 0 auto;
  }

  &__empty {
    max-width: 640px;
    margin: 0 auto;
    padding: 32px 24px;
    background-color: var(--color-surface);
    text-align: center;
    box-shadow: var(--shadow-soft);
  }

  &__empty h2 {
    margin: 0 0 10px;
  }

  &__empty p {
    margin: 0;
    color: var(--color-text-muted);
  }

  &__reset {
    margin-top: 18px;
    padding: 10px 14px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  &__reset:hover,
  &__reset:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  &__suggestions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
  }

  &__suggestion {
    padding: 8px 12px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: var(--color-page-bg);
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  &__suggestion:hover,
  &__suggestion:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  @media (max-width: 480px) {
    padding: 24px 16px 40px;
    &__form {
      flex-direction: column;
    }

    &__actions {
      width: 100%;
    }

    &__button {
      flex: 1;
    }

    &__results {
      grid-template-columns: 1fr;
      max-width: 280px;
    }

    &__title {
      font-size: 28px;
    }
  }
}
</style>
