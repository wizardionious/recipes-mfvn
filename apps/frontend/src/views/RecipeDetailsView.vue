<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { recipes } from "@/data/recipes";
import { ArrowLeft } from "@lucide/vue";

const route = useRoute();

const recipeSlug = computed(() => {
  return String(route.params.slug ?? "");
});

const recipe = computed(() => {
  return recipes.find((recipeItem) => recipeItem.slug === recipeSlug.value);
});
</script>

<template>
  <DefaultLayout>
    <main class="recipe-details">
      <article v-if="recipe" class="recipe-details__article">
        <RouterLink
          :to="{ name: 'home' }"
          class="recipe-details__back inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft :size="16" />
          <span>Назад на главную</span>
        </RouterLink>

        <section class="recipe-details__hero">
          <img
            :src="recipe.image.url"
            :alt="recipe.image.alt || recipe.title"
            class="recipe-details__hero-image"
          />

          <div class="recipe-details__intro">
            <p class="recipe-details__category">
              {{ recipe.category.name }}
            </p>

            <h1 class="recipe-details__title">
              {{ recipe.title }}
            </h1>

            <p class="recipe-details__description">
              {{ recipe.description }}
            </p>

            <div class="recipe-details__meta flex flex-wrap gap-10px">
              <span>Время: {{ recipe.cookingTime }} мин.</span>
              <span>Порций: {{ recipe.servings }}</span>
              <span>Сложность: {{ recipe.difficulty }}</span>
            </div>
          </div>
        </section>

        <section class="recipe-details__section">
          <div class="recipe-details__section-title-row">
            <div class="recipe-details__section-line"></div>

            <h2 class="recipe-details__section-title">Ингредиенты</h2>

            <div class="recipe-details__section-line"></div>
          </div>

          <ul class="recipe-details__ingredients">
            <li
              v-for="ingredient in recipe.ingredients"
              :key="ingredient.name"
              class="recipe-details__ingredient flex justify-between gap-4"
            >
              <span class="recipe-details__ingredient-name">
                {{ ingredient.name }}
              </span>

              <span class="recipe-details__ingredient-amount">
                {{ ingredient.quantity }} {{ ingredient.unit }}
              </span>
            </li>
          </ul>
        </section>

        <section class="recipe-details__section">
          <div class="recipe-details__section-title-row">
            <div class="recipe-details__section-line"></div>

            <h2 class="recipe-details__section-title">Приготовление</h2>

            <div class="recipe-details__section-line"></div>
          </div>

          <ol class="recipe-details__instructions">
            <li
              v-for="instruction in recipe.instructions"
              :key="instruction"
              class="recipe-details__instruction"
            >
              {{ instruction }}
            </li>
          </ol>
        </section>
      </article>

      <section v-else class="recipe-details__not-found">
        <h1>Рецепт не найден</h1>

        <p>
          Мы не нашли рецепт по адресу:
          <strong>{{ recipeSlug }}</strong>
        </p>

        <RouterLink
          :to="{ name: 'home' }"
          class="recipe-details__back inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft :size="16" />
          <span>Вернуться на главную</span>
        </RouterLink>
      </section>
    </main>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.recipe-details {
  min-height: 100vh;
  padding: 32px 16px 64px;
  background-color: var(--color-page-bg);
  color: var(--color-text-main);

  &__article {
    width: 100%;
    max-width: 1060px;
    margin: 0 auto;
  }

  &__back {
    margin-bottom: 18px;
    color: var(--color-accent);
    font-weight: 700;
    text-decoration: none;

    &:hover {
      color: var(--color-accent-strong);
    }
  }

  &__hero {
    max-width: 760px;
    margin-bottom: 44px;
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }

  &__hero-image {
    display: block;
    width: 100%;
    height: 280px;
    margin-bottom: 0;
    object-fit: cover;
    object-position: center 45%;
  }

  &__intro {
    max-width: none;
    padding: 24px 28px 28px;
    margin-bottom: 0;
    background-color: transparent;
  }

  &__category {
    margin: 0 0 10px;
    color: var(--color-accent);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  &__title {
    max-width: 620px;
    margin: 0 0 14px;
    color: var(--color-text-main);
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  &__description {
    max-width: 620px;
    margin: 0 0 22px;
    color: var(--color-text-body);
    font-size: 16px;
    line-height: 1.7;
  }

  &__meta span {
    padding: 9px 14px;
    background-color: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 13px;
    line-height: 1;
  }

  &__section {
    margin-top: 42px;
  }

  &__section-title-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 18px;
    margin-bottom: 24px;
  }

  &__section-line {
    height: 1px;
    background-color: var(--color-border-soft);
  }

  &__section-title {
    margin: 0;
    color: var(--color-text-main);
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__ingredients {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 20px;
    max-width: 760px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__ingredient {
    padding: 14px 16px;
    background-color: var(--color-surface);
    color: var(--color-text-body);
    font-size: 15px;
    line-height: 1.4;
  }

  &__ingredient-name {
    font-weight: 600;
  }

  &__ingredient-amount {
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  &__instructions {
    max-width: 760px;
    margin: 0;
    padding: 24px 28px 24px 52px;
    background-color: var(--color-surface);
  }

  &__instruction {
    margin-bottom: 14px;
    color: var(--color-text-body);
    font-size: 16px;
    line-height: 1.7;
  }

  &__instruction:last-child {
    margin-bottom: 0;
  }

  &__not-found {
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 24px;
    background-color: var(--color-surface);
    text-align: center;
    box-shadow: var(--shadow-soft);
  }
}

@media (max-width: 768px) {
  .recipe-details {
    padding: 20px 16px 48px;

    &__hero-image {
      display: block;
      width: 100%;
      height: 300px;
      margin-bottom: 20px;
      object-fit: cover;
      object-position: center 45%;
    }

    &__title {
      font-size: 32px;
      line-height: 1.12;
    }

    &__description {
      font-size: 15px;
    }

    &__section-title-row {
      gap: 12px;
    }

    &__section-title {
      font-size: 15px;
    }

    &__ingredients {
      grid-template-columns: 1fr;
    }

    &__ingredient {
      font-size: 14px;
    }
  }
}
</style>
