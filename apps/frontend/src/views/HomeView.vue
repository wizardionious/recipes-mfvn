<script setup lang="ts">
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { recipes } from "@/data/recipes";
import { RouterLink } from "vue-router";

const featuredRecipe = {
  ...recipes[0],
  title: "Хлеб, масло и идеальный кофе",
  description:
    "Завтрак с ароматным кофе, свежим хлебом и нежным маслом для спокойного утра.",
  previews: [
    "/images/recipes/coffeWithButter_preview_01.jpg",
    "/images/recipes/coffeWithButter_preview_02.jpg",
    "/images/recipes/coffeWithButter_preview_03.jpg",
    "/images/recipes/coffeWithButter_preview_03.webp",
  ],
  heroImage: "/images/recipes/coffeWithButter.jpg",
};

const marketRecipes = [
  {
    id: 1,
    category: "МОРАНГО",
    title: "Винегрет с клубникой",
    image:
      "https://plus.unsplash.com/premium_photo-1663852296872-51c74244d487?q=80&w=687&fit=crop",
  },
  {
    id: 2,
    category: "ТОМАТЕ",
    title: "Тост с особенным томатным соусом",
    image:
      "https://images.unsplash.com/photo-1620921575116-fb8902865f81?q=80&w=735&fit=crop",
  },
  {
    id: 3,
    category: "АЛЬО ПОРО",
    title: "Тёплый салат с луком-пореем",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&fit=crop",
  },
  {
    id: 4,
    category: "БЕТЕРРАБА",
    title: "Практичное ризотто со свёклой",
    image:
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800&fit=crop",
  },
];
</script>

<template>
  <DefaultLayout>
    <main class="home-page">
      <section class="home-page__hero">
        <RouterLink
          :to="{
            name: 'recipe-details',
            params: {
              slug: featuredRecipe.slug,
            },
          }"
          class="home-page__hero-link"
        >
          <img
            :src="featuredRecipe.heroImage"
            :alt="featuredRecipe.title"
            class="home-page__hero-image"
          />

          <div class="home-page__hero-body">
            <div class="home-page__hero-text">
              <h1 class="home-page__hero-title">
                {{ featuredRecipe.title }}
              </h1>

              <p class="home-page__hero-description">
                {{ featuredRecipe.description }}
              </p>
            </div>

            <div class="home-page__hero-previews" aria-label="Recipe previews">
              <span
                v-for="preview in featuredRecipe.previews"
                :key="preview"
                class="home-page__hero-preview"
              >
                <img
                  :src="preview"
                  alt=""
                  class="home-page__hero-preview-image"
                />
              </span>
            </div>
          </div>
        </RouterLink>

        <div class="home-page__slider-dots" aria-hidden="true">
          <span
            class="home-page__slider-dot home-page__slider-dot--active"
          ></span>
          <span class="home-page__slider-dot"></span>
          <span class="home-page__slider-dot"></span>
          <span class="home-page__slider-dot"></span>
        </div>
      </section>

      <section class="home-page__seasonal">
        <header class="home-page__section-header">
          <div class="home-page__section-title-row">
            <div class="home-page__section-line"></div>

            <h2 class="home-page__section-title">ECONOMIZE NA FEIRA</h2>

            <div class="home-page__section-line"></div>
          </div>

          <p class="home-page__section-subtitle">
            ALIMENTOS DA ÉPOCA TÊM PREÇO MAIS BAIXO E SÃO MAIS SABOROSOS
          </p>
        </header>

        <div class="home-page__recipe-grid">
          <article
            v-for="recipe in marketRecipes"
            :key="recipe.id"
            class="home-page__recipe-card"
          >
            <a href="#" class="home-page__recipe-link" @click.prevent>
              <span class="home-page__recipe-image-wrapper">
                <img
                  :src="recipe.image"
                  :alt="recipe.title"
                  class="home-page__recipe-image"
                />
              </span>

              <p class="home-page__recipe-category">
                {{ recipe.category }}
              </p>

              <h3 class="home-page__recipe-title">
                {{ recipe.title }}
              </h3>
            </a>
          </article>
        </div>
      </section>
    </main>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.home-page {
  background-color: var(--color-page-bg);

  &__hero {
    width: 100%;
    padding: 0 16px;
    background-color: var(--color-surface);
  }

  &__hero-image {
    display: block;
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  &__hero-body {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 16px;
    padding: 14px 0 0;
  }

  &__hero-text {
    min-width: 0;
  }

  &__hero-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  &__hero-title {
    width: 100%;
    max-width: none;
    margin: 0;
    color: var(--color-text-main);
    font-size: clamp(18px, 4.2vw, 20px);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }

  &__hero-description {
    margin: 8px 0 0;
    color: var(--color-text-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  &__hero-previews {
    display: flex;
    gap: 8px;
  }

  &__hero-preview {
    display: block;
    width: 52px;
    height: 40px;
    padding: 0;
    border: none;
    background-color: transparent;
    cursor: pointer;
  }

  &__hero-preview-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__slider-dots {
    display: flex;
    justify-content: center;
    gap: 5px;
    padding: 10px 0 28px;
  }

  &__slider-dot {
    width: 4px;
    height: 4px;
    border-radius: var(--radius-round);
    background-color: var(--color-slider-dot);
  }

  &__slider-dot--active {
    background-color: var(--color-slider-dot-active);
  }

  &__seasonal {
    padding: 0 16px 40px;
  }

  &__section-header {
    margin-bottom: 22px;
    text-align: center;
  }

  &__section-title-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 14px;
  }

  &__section-line {
    height: 1px;
    background-color: var(--color-border-soft);
  }

  &__section-text {
    text-align: center;
  }

  &__section-title {
    margin: 0;
    color: var(--color-text-main);
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__section-subtitle {
    max-width: 250px;
    margin: 8px auto 0;
    color: var(--color-text-muted);
    font-size: 9px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0.7px;
    text-transform: uppercase;
  }

  &__recipe-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px 16px;
  }

  &__recipe-card {
    min-width: 0;
  }

  &__recipe-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  &__recipe-image-wrapper {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: var(--color-border-soft);
  }

  &__recipe-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      transform 180ms ease,
      filter 180ms ease;
  }

  &__recipe-category {
    margin: 10px 0 4px;
    color: var(--color-seasonal);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__recipe-title {
    margin: 0;
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.35;
  }

  &__recipe-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 4px;
  }

  @media (hover: hover) {
    &__recipe-link:hover &__recipe-image {
      transform: scale(1.04);
      filter: brightness(0.96);
    }

    &__recipe-link:hover &__recipe-title {
      color: var(--color-accent-strong);
    }
  }
}

@media (max-width: 480px) {
  .home-page__hero-image {
    height: 170px;
  }

  .home-page__hero-body {
    display: block;
    padding: 14px 0px 8px;
  }

  .home-page__hero-title {
    font-size: 20px;
  }

  .home-page__hero-description {
    display: none;
  }

  .home-page__hero-previews {
    display: none;
  }
}
</style>
