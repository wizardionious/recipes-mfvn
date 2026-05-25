<script setup lang="ts">
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import CarouselIndicators from "@/components/ui/CarouselIndicators.vue";
import SectionHeader from "@/components/ui/SectionHeader.vue";
import { recipes } from "@/data/recipes";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

const featuredRecipe = recipes.find(
  (recipe) => recipe.previewImages.length > 0,
);

if (!featuredRecipe) {
  throw new Error("Featured recipe was not found");
}

const seasonalRecipes = recipes
  .filter((recipe) => recipe.slug !== featuredRecipe.slug)
  .slice(0, 4);

const marketRecipes = seasonalRecipes.map((recipe) => {
  return {
    id: recipe.id,
    slug: recipe.slug,
    category: recipe.seasonalTag ?? recipe.category.name,
    title: recipe.title,
    image: recipe.image.url,
    imageAlt: recipe.image.alt ?? recipe.title,
  };
});

const activeHeroImageIndex = ref(0);

const heroImages = computed(() => [
  featuredRecipe.image.url,
  ...featuredRecipe.previewImages,
]);

const activeHeroImage = computed(() => {
  return (
    heroImages.value[activeHeroImageIndex.value] ?? featuredRecipe.image.url
  );
});

function setActiveHeroImage(index: number) {
  activeHeroImageIndex.value = index;
}
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
            :src="activeHeroImage"
            :alt="featuredRecipe.image?.alt"
            class="home-page__hero-image"
          />
        </RouterLink>

        <div class="home-page__hero-body">
          <RouterLink
            :to="{
              name: 'recipe-details',
              params: {
                slug: featuredRecipe.slug,
              },
            }"
            class="home-page__hero-link home-page__hero-text"
          >
            <h1 class="home-page__hero-title">
              {{ featuredRecipe.title }}
            </h1>

            <p class="home-page__hero-description">
              {{ featuredRecipe.description }}
            </p>
          </RouterLink>

          <div class="home-page__hero-previews flex items-center gap-2">
            <button
              v-for="(preview, index) in featuredRecipe.previewImages"
              :key="preview"
              type="button"
              class="home-page__hero-preview"
              :class="{
                'home-page__hero-preview--active':
                  activeHeroImageIndex === index + 1,
              }"
              @click="setActiveHeroImage(index + 1)"
            >
              <img
                :src="preview"
                alt=""
                class="home-page__hero-preview-image"
              />
            </button>
          </div>
        </div>

        <CarouselIndicators
          :count="heroImages.length"
          :active="activeHeroImageIndex"
          @set-active="setActiveHeroImage"
        />
      </section>

      <section class="home-page__seasonal" id="recipes">
        <SectionHeader
          title="Экономьте на рынке"
          subtitle="Сезонные продукты дешевле и вкуснее"
        />

        <div class="home-page__recipe-grid grid gap-x-5 gap-y-8">
          <article
            v-for="recipe in marketRecipes"
            :key="recipe.id"
            class="home-page__recipe-card"
          >
            <component
              :is="recipe.slug ? RouterLink : 'a'"
              :to="
                recipe.slug
                  ? {
                      name: 'recipe-details',
                      params: {
                        slug: recipe.slug,
                      },
                    }
                  : undefined
              "
              :href="recipe.slug ? undefined : '#'"
              class="home-page__recipe-link"
              @click="!recipe.slug && $event.preventDefault()"
            >
              <span class="home-page__recipe-image-wrapper">
                <img
                  :src="recipe.image"
                  :alt="recipe.imageAlt"
                  class="home-page__recipe-image"
                />
              </span>

              <div class="home-page__recipe-content pt-8 px-8 pb-10">
                <p
                  class="home-page__recipe-category m-0 mb-3 text-3xs font-bold tracking-wide uppercase"
                >
                  {{ recipe.category }}
                </p>

                <h3 class="home-page__recipe-title m-0">
                  {{ recipe.title }}
                </h3>
              </div>
            </component>
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

  &__hero-preview {
    width: 52px;
    height: 40px;
    padding: 0;
    border: none;
    background-color: transparent;
    cursor: pointer;
  }

  &__hero-preview--active {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &__hero-preview-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__seasonal {
    padding: 28px 16px 40px;
  }

  &__recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  &__recipe-card {
    min-width: 0;
    overflow: hidden;
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
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

  &__recipe-content {
    min-height: 78px;
    background-color: var(--color-surface);
  }

  &__recipe-category {
    color: var(--color-seasonal);
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
