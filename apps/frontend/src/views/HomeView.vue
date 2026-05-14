<script setup lang="ts">
import DefaultLayout from "@/components/layout/DefaultLayout.vue";

const featuredRecipe = {
  title: "ПАО, МАСЛО И ИДЕАЛЬНЫЙ КОФЕ",
  image: "/images/recipes/coffee.jpg",
};

const marketRecipes = [
  {
    id: 1,
    category: "МОРАНГО",
    title: "Винегрет с клубникой",
    image: "/images/recipes/strawberry-salad.jpg",
  },
  {
    id: 2,
    category: "ТОМАТЕ",
    title: "Тост с особенным томатным соусом",
    image: "/images/recipes/tomato-toast.jpg",
  },
  {
    id: 3,
    category: "АЛЬО ПОРО",
    title: "Тёплый салат с луком-пореем",
    image: "/images/recipes/leek-salad.jpg",
  },
  {
    id: 4,
    category: "БЕТЕРРАБА",
    title: "Практичное ризотто со свёклой",
    image: "/images/recipes/beetroot-risotto.jpg",
  },
];
</script>

<template>
  <DefaultLayout>
    <main class="home-page">
      <section class="home-page__hero">
        <img
          :src="featuredRecipe.image"
          :alt="featuredRecipe.title"
          class="home-page__hero-image"
        />

        <div class="home-page__hero-content">
          <h1 class="home-page__hero-title">
            {{ featuredRecipe.title }}
          </h1>

          <div class="home-page__slider-dots" aria-hidden="true">
            <span class="home-page__slider-dot home-page__slider-dot--active"></span>
            <span class="home-page__slider-dot"></span>
            <span class="home-page__slider-dot"></span>
            <span class="home-page__slider-dot"></span>
          </div>
        </div>
      </section>

      <section class="home-page__market">
        <header class="home-page__section-header">
          <div class="home-page__section-line"></div>

          <div class="home-page__section-text">
            <h2 class="home-page__section-title">ECONOMIZE NA FEIRA</h2>

            <p class="home-page__section-subtitle">
              ALIMENTOS DA ÉPOCA TÊM PREÇO MAIS BAIXO E SÃO MAIS SABOROSOS
            </p>
          </div>

          <div class="home-page__section-line"></div>
        </header>

        <div class="home-page__recipe-grid">
          <article v-for="recipe in marketRecipes" :key="recipe.id" class="home-page__recipe-card">
            <img :src="recipe.image" :alt="recipe.title" class="home-page__recipe-image" />

            <p class="home-page__recipe-category">
              {{ recipe.category }}
            </p>

            <h3 class="home-page__recipe-title">
              {{ recipe.title }}
            </h3>
          </article>
        </div>
      </section>
    </main>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.home-page {
  background-color: #ffffff;

  &__hero {
    width: 100%;
  }

  &__hero-image {
    display: block;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  &__hero-content {
    padding: 18px 24px 22px;
  }

  &__hero-title {
    margin: 0;
    color: #333333;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  &__slider-dots {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 14px;
  }

  &__slider-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #d8d8d8;
  }

  &__slider-dot--active {
    background-color: #777777;
  }

  &__market {
    padding: 8px 16px 32px;
  }

  &__section-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__section-line {
    height: 1px;
    background-color: #eeeeee;
  }

  &__section-text {
    text-align: center;
  }

  &__section-title {
    margin: 0;
    color: #333333;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  &__section-subtitle {
    max-width: 240px;
    margin: 6px auto 0;
    color: #777777;
    font-size: 9px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 0.8px;
  }

  &__recipe-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 22px 16px;
  }

  &__recipe-card {
    min-width: 0;
  }

  &__recipe-image {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  &__recipe-category {
    margin: 8px 0 4px;
    color: #60b7aa;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__recipe-title {
    margin: 0;
    color: #333333;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.3;
  }
}
</style>
