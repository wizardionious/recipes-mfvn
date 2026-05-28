<script lang="ts" setup>
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import RecipeCard from "@/components/ui/RecipeCard.vue";
import { recipes } from "@/data/recipes";
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@lucide/vue";

defineOptions({
  name: "RecipesPage",
});

const route = useRoute();

const router = useRouter();
const localQuery = ref("");

const searchQuery = computed(() => {
  return String(route.query.search ?? "")
    .trim()
    .toLowerCase();
});

watch(
  searchQuery,
  (newSearchQuery) => {
    localQuery.value = newSearchQuery;
  },
  {
    immediate: true,
  },
);

async function submitSearch() {
  const nextSearchQuery = localQuery.value.trim();

  await router.push({
    path: "/recipes",
    query: {
      ...(nextSearchQuery && { search: nextSearchQuery }),
    },
  });
}

const searchResults = computed(() => {
  if (!searchQuery.value) {
    return recipes.map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug,
      category: recipe.category.name,
      title: recipe.title,
      image: recipe.image.url,
      imageAlt: recipe.image.alt ?? recipe.title,
    }));
  }

  return recipes
    .filter((recipe) => {
      const searchableText = [
        recipe.title,
        recipe.description,
        recipe.category.name,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchQuery.value);
    })
    .map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug,
      category: recipe.category.name,
      title: recipe.title,
      image: recipe.image.url,
      imageAlt: recipe.image.alt ?? recipe.title,
    }));
});
</script>

<template>
  <DefaultLayout>
    <section class="search-page">
      <RouterLink
        to="/"
        class="search-page__back inline-flex items-center gap-2"
      >
        <ArrowLeft :size="16" />На главную
      </RouterLink>

      <header class="search-page__header">
        <h1 class="search-page__title">Поиск рецептов</h1>

        <p v-if="searchQuery" class="search-page__subtitle">
          Результаты по запросу: <strong>{{ searchQuery }}</strong>
        </p>

        <p v-else class="search-page__subtitle">
          Введите запрос в поиске, чтобы найти рецепт.
        </p>
      </header>

      <form
        class="search-page__form"
        role="search"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="localQuery"
          class="search-page__input"
          type="search"
          placeholder="Введите название, категорию или ингредиент"
        />

        <button class="search-page__button" type="submit">Найти</button>
      </form>

      <p v-if="searchQuery" class="search-page__count">
        Найдено рецептов: {{ searchResults.length }}
      </p>

      <section v-if="searchResults.length" class="search-page__results">
        <RecipeCard
          v-for="recipeCard in searchResults"
          :key="recipeCard.id"
          :recipe="recipeCard"
        />
      </section>

      <section v-else-if="searchQuery" class="search-page__empty">
        <h2>Ничего не найдено</h2>

        <p>
          Попробуй другой запрос: название рецепта, категорию или ингредиент.
        </p>
      </section>
    </section>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.search-page {
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

  &__button {
    height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-md);
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-weight: 700;
    cursor: pointer;
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
  @media (max-width: 480px) {
    &__form {
      flex-direction: column;
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
