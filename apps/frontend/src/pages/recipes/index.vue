<script lang="ts" setup>
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import { RecipeCard } from "@/entities/recipe";
import RecipeSearchForm from "./components/RecipeSearchForm.vue";
import { recipes } from "@/data/recipes";
import { computed, ref, watch } from "vue";
import {
  RouterLink,
  useRoute,
  useRouter,
} from "vue-router";
import { ArrowLeft } from "@lucide/vue";
import { normalizeSearchText } from "@/utils/normalizeSearchText";

defineOptions({
  name: "RecipesPage",
});

const route = useRoute();
const router = useRouter();

const localQuery = ref("");
const isFiltersPanelOpen = ref(false);

type FilterMode = "basic" | "advanced";

const filterMode = computed<FilterMode>(() => {
  return route.query.filterMode === "advanced"
    ? "advanced"
    : "basic";
});

const isAdvancedFilterMode = computed(() => {
  return filterMode.value === "advanced";
});

type Recipe = (typeof recipes)[number];

const searchQuery = computed(() => {
  return String(route.query.search ?? "").trim();
});

const normalizedSearchQuery = computed(() => {
  return normalizeSearchText(searchQuery.value);
});

type RecipeFilterOption = {
  label: string;
  value: string;
};

type RecipeTagFilterGroup = {
  title: string;
  options: RecipeFilterOption[];
};

const mealTypeFilters: RecipeFilterOption[] = [
  { label: "Завтраки", value: "breakfast" },
  { label: "Обеды", value: "lunch" },
  { label: "Ужины", value: "dinner" },
  { label: "Перекусы", value: "snack" },
];

const recipeTagFilterGroups: RecipeTagFilterGroup[] = [
  {
    title: "Способ приготовления",
    options: [
      { label: "На пару", value: "steam" },
      { label: "Сковородка", value: "pan" },
      { label: "Плита", value: "stove" },
      { label: "Духовка", value: "oven" },
      { label: "Аэрогриль", value: "air-fryer" },
      { label: "Без готовки", value: "no-cook" },
    ],
  },
  {
    title: "Основной ингредиент",
    options: [
      { label: "Рыба", value: "fish" },
      { label: "Мясо", value: "meat" },
      { label: "Птица", value: "poultry" },
      { label: "Индейка", value: "turkey" },
      { label: "Курица", value: "chicken" },
      { label: "Яйца", value: "eggs" },
      { label: "Овощи", value: "vegetables" },
      { label: "Крупы", value: "grains" },
      { label: "Ягоды", value: "berries" },
      { label: "Фрукты", value: "fruits" },
    ],
  },
  {
    title: "Диеты и питание",
    options: [
      { label: "Диета №5", value: "diet-5" },
      { label: "Натуральное питание", value: "natural" },
      { label: "Белковые", value: "protein" },
      { label: "Лёгкие", value: "light" },
      { label: "Низкожирные", value: "low-fat" },
      { label: "Без жарки", value: "no-fry" },
    ],
  },
  {
    title: "Тип блюда",
    options: [
      { label: "Салаты", value: "salad" },
      { label: "Тосты", value: "toast" },
      { label: "Смузи", value: "smoothie" },
      { label: "Горячие блюда", value: "hot-dish" },
      { label: "Супы", value: "soup" },
      { label: "Гарниры", value: "side-dish" },
    ],
  },
  {
    title: "Сезонность",
    options: [
      { label: "Сезонные", value: "seasonal" },
      { label: "Весна", value: "spring" },
      { label: "Лето", value: "summer" },
      { label: "Осень", value: "autumn" },
      { label: "Зима", value: "winter" },
    ],
  },
  {
    title: "Скорость",
    options: [
      { label: "Быстро", value: "quick" },
      { label: "До 15 минут", value: "under-15-min" },
      { label: "До 30 минут", value: "under-30-min" },
    ],
  },
];

const recipeTagFilters = computed<RecipeFilterOption[]>(
  () => {
    return recipeTagFilterGroups.flatMap(
      (group) => group.options,
    );
  },
);

type RecipeWithFilters = Recipe & {
  mealTypes?: string[];
  tags?: string[];
  seasonalTag?: string;
};

function getQueryList(queryValue: unknown) {
  if (Array.isArray(queryValue)) {
    return queryValue
      .filter(
        (value): value is string =>
          typeof value === "string",
      )
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (typeof queryValue !== "string") {
    return [];
  }

  const trimmedValue = queryValue.trim();

  return trimmedValue ? [trimmedValue] : [];
}

function getSingleTagPerGroup(tags: string[]) {
  const result: string[] = [];

  recipeTagFilterGroups.forEach((group) => {
    const selectedOption = group.options.find((option) => {
      return tags.includes(option.value);
    });

    if (selectedOption) {
      result.push(selectedOption.value);
    }
  });

  return result;
}

const selectedMealTypes = computed(() => {
  const mealTypes = getQueryList(route.query.meal);

  return isAdvancedFilterMode.value
    ? mealTypes
    : mealTypes.slice(0, 1);
});

const selectedTags = computed(() => {
  const tags = getQueryList(route.query.tag);

  return isAdvancedFilterMode.value
    ? tags
    : getSingleTagPerGroup(tags);
});

const hasSelectedFilters = computed(() => {
  return (
    selectedMealTypes.value.length > 0 ||
    selectedTags.value.length > 0
  );
});

const selectedFiltersCount = computed(() => {
  return (
    selectedMealTypes.value.length +
    selectedTags.value.length
  );
});

const hasActiveSearchOrFilters = computed(() => {
  return (
    Boolean(searchQuery.value) || hasSelectedFilters.value
  );
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

async function goToRecipesCatalog(
  options: {
    searchQuery?: string;
    mealTypes?: string[];
    tags?: string[];
    filterMode?: FilterMode;
  } = {},
) {
  const normalizedQuery = (
    options.searchQuery ?? localQuery.value
  ).trim();
  const nextMealTypes =
    options.mealTypes ?? selectedMealTypes.value;
  const nextTags = options.tags ?? selectedTags.value;
  const nextFilterMode =
    options.filterMode ?? filterMode.value;

  try {
    await router.push({
      path: "/recipes",
      query: {
        ...(normalizedQuery && { search: normalizedQuery }),
        ...(nextMealTypes.length && {
          meal: nextMealTypes,
        }),
        ...(nextTags.length && { tag: nextTags }),
        ...(nextFilterMode === "advanced" && {
          filterMode: "advanced",
        }),
      },
    });
  } catch (error) {
    console.error(
      "Recipes catalog navigation failed:",
      error,
    );
  }
}

async function submitSearch() {
  await goToRecipesCatalog({
    searchQuery: localQuery.value,
  });
}

async function clearSearch() {
  localQuery.value = "";

  await goToRecipesCatalog({
    searchQuery: "",
    mealTypes: [],
    tags: [],
    filterMode: "basic",
  });
}

async function resetFilters() {
  localQuery.value = searchQuery.value;

  await goToRecipesCatalog({
    searchQuery: searchQuery.value,
    mealTypes: [],
    tags: [],
    filterMode: filterMode.value,
  });
}

function openFiltersPanel() {
  isFiltersPanelOpen.value = true;
}

function closeFiltersPanel() {
  isFiltersPanelOpen.value = false;
}

function toggleQueryValue(
  currentValues: string[],
  value: string,
) {
  if (currentValues.includes(value)) {
    return currentValues.filter(
      (currentValue) => currentValue !== value,
    );
  }

  return [...currentValues, value];
}

async function toggleAdvancedFilterMode() {
  const nextFilterMode: FilterMode =
    isAdvancedFilterMode.value ? "basic" : "advanced";

  const nextMealTypes =
    nextFilterMode === "advanced"
      ? selectedMealTypes.value
      : selectedMealTypes.value.slice(0, 1);

  const nextTags =
    nextFilterMode === "advanced"
      ? selectedTags.value
      : getSingleTagPerGroup(selectedTags.value);

  await goToRecipesCatalog({
    searchQuery: searchQuery.value,
    mealTypes: nextMealTypes,
    tags: nextTags,
    filterMode: nextFilterMode,
  });
}

async function toggleMealType(mealType: string) {
  if (isAdvancedFilterMode.value) {
    await goToRecipesCatalog({
      mealTypes: toggleQueryValue(
        selectedMealTypes.value,
        mealType,
      ),
    });

    return;
  }

  const isCurrentMealTypeSelected =
    selectedMealTypes.value.includes(mealType);

  await goToRecipesCatalog({
    mealTypes: isCurrentMealTypeSelected ? [] : [mealType],
  });
}

function getTagGroupValues(tag: string): string[] {
  const tagGroup = recipeTagFilterGroups.find((group) => {
    return group.options.some(
      (option) => option.value === tag,
    );
  });

  if (!tagGroup) {
    return [];
  }

  return tagGroup.options.map((option) => option.value);
}

async function toggleTag(tag: string) {
  if (isAdvancedFilterMode.value) {
    await goToRecipesCatalog({
      tags: toggleQueryValue(selectedTags.value, tag),
    });

    return;
  }

  const tagGroupValues = getTagGroupValues(tag);

  const tagsFromOtherGroups = selectedTags.value.filter(
    (selectedTag) => {
      return !tagGroupValues.includes(selectedTag);
    },
  );

  const isCurrentTagAlreadySelected =
    selectedTags.value.includes(tag);

  const nextTags = isCurrentTagAlreadySelected
    ? tagsFromOtherGroups
    : [...tagsFromOtherGroups, tag];

  await goToRecipesCatalog({
    tags: nextTags,
  });
}

const recipeCards = computed(() => {
  return recipes.filter((recipe) => {
    const recipeWithFilters = recipe as RecipeWithFilters;

    const hasMealType =
      selectedMealTypes.value.length === 0 ||
      selectedMealTypes.value.some((mealType) => {
        return recipeWithFilters.mealTypes?.includes(
          mealType,
        );
      });

    if (!hasMealType) {
      return false;
    }

    const hasSelectedTagGroups =
      recipeTagFilterGroups.every((group) => {
        const selectedGroupTags = group.options
          .map((option) => option.value)
          .filter((value) =>
            selectedTags.value.includes(value),
          );

        if (selectedGroupTags.length === 0) {
          return true;
        }

        return selectedGroupTags.some((tag) => {
          return recipeWithFilters.tags?.includes(tag);
        });
      });

    if (!hasSelectedTagGroups) {
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
        recipeWithFilters.seasonalTag,
        ...recipe.ingredients.map(
          (ingredient) => ingredient.name,
        ),
      ]
        .filter(Boolean)
        .join(" "),
    );

    return searchableText.includes(
      normalizedSearchQuery.value,
    );
  });
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

  if (!hasActiveSearchOrFilters.value) {
    return `Всего ${count} ${recipeWord}`;
  }

  if (recipeWord === "рецепт") {
    return `Найден ${count} ${recipeWord}`;
  }

  return `Найдено ${count} ${recipeWord}`;
});

const activeFilterNames = computed(() => {
  const activeMealTypeNames = mealTypeFilters
    .filter((filter) =>
      selectedMealTypes.value.includes(filter.value),
    )
    .map((filter) => filter.label);

  const activeTagNames = recipeTagFilters.value
    .filter((filter) =>
      selectedTags.value.includes(filter.value),
    )
    .map((filter) => filter.label);

  return [...activeMealTypeNames, ...activeTagNames];
});

const activeFilterText = computed(() => {
  return activeFilterNames.value.join(", ");
});

const emptyStateTitle = computed(() => {
  if (searchQuery.value && hasSelectedFilters.value) {
    return "Ничего не найдено по этим фильтрам";
  }

  if (hasSelectedFilters.value) {
    return "По выбранным фильтрам пока нет рецептов";
  }

  return "Ничего не найдено";
});

const suggestedSearchQueries = [
  "кофе",
  "хлеб",
  "свёкла",
  "клубника",
  "салат",
];

async function searchBySuggestion(suggestedQuery: string) {
  localQuery.value = suggestedQuery;

  await goToRecipesCatalog({
    searchQuery: suggestedQuery,
  });
}
</script>

<template>
  <DefaultLayout>
    <section class="recipes-page">
      <RouterLink
        to="/"
        class="recipes-page__back inline-flex items-center gap-2"
      >
        <ArrowLeft :size="16" aria-hidden="true" />На
        главную
      </RouterLink>

      <header class="recipes-page__header">
        <h1 class="recipes-page__title">
          {{
            searchQuery
              ? "Поиск рецептов"
              : "Каталог рецептов"
          }}
        </h1>

        <p
          v-if="searchQuery && activeFilterText"
          class="recipes-page__subtitle"
        >
          Результаты по запросу:
          <strong>«{{ searchQuery }}»</strong> с фильтрами:
          <strong>«{{ activeFilterText }}»</strong>
        </p>

        <p
          v-else-if="searchQuery"
          class="recipes-page__subtitle"
        >
          Результаты по запросу:
          <strong>«{{ searchQuery }}»</strong>
        </p>

        <p
          v-else-if="activeFilterText"
          class="recipes-page__subtitle"
        >
          Фильтры: <strong>«{{ activeFilterText }}»</strong>
        </p>

        <p v-else class="recipes-page__subtitle">
          Ищите по названию, приёму пищи, тегу или
          ингредиенту.
        </p>
      </header>

      <RecipeSearchForm
        v-model="localQuery"
        :show-clear-button="hasActiveSearchOrFilters"
        @submit-search="submitSearch"
        @clear-search="clearSearch"
      />

      <div class="recipes-page__filter-bar">
        <button
          type="button"
          class="recipes-page__filter-open"
          @click="openFiltersPanel"
        >
          Фильтры

          <span
            v-if="selectedFiltersCount"
            class="recipes-page__filter-open-count"
          >
            {{ selectedFiltersCount }}
          </span>
        </button>

        <p
          v-if="activeFilterText"
          class="recipes-page__filter-bar-text"
        >
          Активные:
          <strong>«{{ activeFilterText }}»</strong>
        </p>

        <button
          v-if="hasSelectedFilters"
          type="button"
          class="recipes-page__filter-bar-reset"
          @click="resetFilters"
        >
          Сбросить
        </button>
      </div>

      <div
        v-if="isFiltersPanelOpen"
        class="recipes-page__filters-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры рецептов"
        @click.self="closeFiltersPanel"
      >
        <aside class="recipes-page__filters-panel">
          <header
            class="recipes-page__filters-panel-header"
          >
            <button
              type="button"
              class="recipes-page__filters-panel-close"
              aria-label="Закрыть фильтры"
              @click="closeFiltersPanel"
            >
              ×
            </button>

            <h2 class="recipes-page__filters-panel-title">
              Фильтры
            </h2>

            <button
              v-if="hasSelectedFilters"
              type="button"
              class="recipes-page__filters-panel-reset"
              @click="resetFilters"
            >
              Очистить
            </button>
          </header>

          <div class="recipes-page__filters-panel-body">
            <div class="recipes-page__filter-mode">
              <div
                class="recipes-page__filter-mode-content"
              >
                <h3 class="recipes-page__filter-mode-title">
                  Режим подбора
                </h3>

                <p class="recipes-page__filter-mode-text">
                  {{
                    isAdvancedFilterMode
                      ? "Расширенный режим: можно выбрать несколько вариантов в каждой группе."
                      : "Обычный режим: в каждой группе выбирается только один вариант."
                  }}
                </p>
              </div>

              <button
                type="button"
                class="recipes-page__filter-mode-button"
                :class="{
                  'recipes-page__filter-mode-button--active':
                    isAdvancedFilterMode,
                }"
                @click="toggleAdvancedFilterMode"
              >
                {{
                  isAdvancedFilterMode
                    ? "Выключить"
                    : "Расширенный режим"
                }}
              </button>
            </div>

            <div class="recipes-page__filter-group">
              <h3 class="recipes-page__filter-title">
                Приём пищи
              </h3>

              <div class="recipes-page__filter-list">
                <button
                  v-for="filter in mealTypeFilters"
                  :key="filter.value"
                  type="button"
                  class="recipes-page__filter-chip"
                  :class="{
                    'recipes-page__filter-chip--active':
                      selectedMealTypes.includes(
                        filter.value,
                      ),
                  }"
                  @click="toggleMealType(filter.value)"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <div class="recipes-page__dropdown-filters">
              <details
                v-for="group in recipeTagFilterGroups"
                :key="group.title"
                class="recipes-page__filter-dropdown"
              >
                <summary
                  class="recipes-page__filter-summary"
                >
                  <span
                    class="recipes-page__filter-summary-main"
                  >
                    <span>{{ group.title }}</span>

                    <span
                      v-if="
                        group.options.filter((option) =>
                          selectedTags.includes(
                            option.value,
                          ),
                        ).length
                      "
                      class="recipes-page__filter-summary-count"
                    >
                      {{
                        group.options.filter((option) =>
                          selectedTags.includes(
                            option.value,
                          ),
                        ).length
                      }}
                    </span>
                  </span>
                </summary>

                <div
                  class="recipes-page__filter-list recipes-page__filter-list--inside"
                >
                  <button
                    v-for="filter in group.options"
                    :key="filter.value"
                    type="button"
                    class="recipes-page__filter-chip"
                    :class="{
                      'recipes-page__filter-chip--active':
                        selectedTags.includes(filter.value),
                    }"
                    @click="toggleTag(filter.value)"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </details>
            </div>
          </div>

          <footer
            class="recipes-page__filters-panel-footer"
          >
            <p class="recipes-page__filters-panel-count">
              {{ resultCountText }}
            </p>

            <button
              type="button"
              class="recipes-page__filters-panel-submit"
              @click="closeFiltersPanel"
            >
              Показать рецепты
            </button>
          </footer>
        </aside>
      </div>

      <p class="recipes-page__count" aria-live="polite">
        {{ resultCountText }}
      </p>

      <section
        v-if="recipeCards.length"
        class="recipes-page__results"
      >
        <RecipeCard
          v-for="recipeCard in recipeCards"
          :key="recipeCard.id"
          :recipe="recipeCard"
        />
      </section>

      <section
        v-else-if="hasActiveSearchOrFilters"
        class="recipes-page__empty"
      >
        <h2>{{ emptyStateTitle }}</h2>

        <p v-if="searchQuery && activeFilterText">
          По запросу <strong>«{{ searchQuery }}»</strong> с
          фильтрами
          <strong>«{{ activeFilterText }}»</strong> ничего
          не найдено. Попробуй другой запрос или очисти
          фильтры.
        </p>

        <p v-else-if="activeFilterText">
          По фильтрам
          <strong>«{{ activeFilterText }}»</strong> пока нет
          рецептов. Можно выбрать другие фильтры или
          посмотреть весь список.
        </p>

        <p v-else>
          Попробуй другой запрос или выбери одну из
          подсказок ниже.
        </p>

        <button
          v-if="hasSelectedFilters"
          type="button"
          class="recipes-page__reset"
          @click="clearSearch"
        >
          Показать все рецепты
        </button>

        <div
          class="recipes-page__suggestions"
          aria-label="Подсказки поиска"
        >
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
  &__empty strong,
  &__filter-bar-text strong {
    color: var(--color-text-body);
    font-weight: 700;
  }

  &__filter-bar {
    max-width: 560px;
    margin: 0 auto 28px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__filter-open {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text-body);
    font-size: 15px;
    font-weight: 700;
    box-shadow: var(--shadow-soft);
    cursor: pointer;
  }

  &__filter-open:hover,
  &__filter-open:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  &__filter-open-count {
    min-width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    border-radius: 999px;
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  &__filter-bar-text {
    flex: 1;
    margin: 0;
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1.4;
  }

  &__filter-bar-reset {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid var(--color-border-soft);
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  &__filter-bar-reset:hover,
  &__filter-bar-reset:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  &__filters-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    justify-content: center;
    background-color: var(--color-page-bg);
  }

  &__filters-panel {
    width: min(520px, 100%);
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-page-bg);
    color: var(--color-text-main);
  }

  &__filters-panel-header {
    min-height: 64px;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border-bottom: 1px solid var(--color-border-soft);
    background-color: var(--color-surface);
  }

  &__filters-panel-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }

  &__filters-panel-close:hover,
  &__filters-panel-close:focus-visible {
    background-color: var(--color-page-bg);
    color: var(--color-accent-strong);
  }

  &__filters-panel-title {
    margin: 0;
    color: var(--color-text-main);
    font-size: 22px;
    font-weight: 700;
    text-align: center;
  }

  &__filters-panel-reset {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-accent-strong);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  &__filters-panel-reset:hover,
  &__filters-panel-reset:focus-visible {
    background-color: var(--color-accent);
    color: var(--color-surface);
  }

  &__filters-panel-body {
    flex: 1;
    overflow-y: auto;
    display: grid;
    align-content: start;
    gap: 14px;
    padding: 16px;
  }

  &__filters-panel-footer {
    padding: 14px 16px 16px;
    border-top: 1px solid var(--color-border-soft);
    background-color: var(--color-surface);
  }

  &__filters-panel-count {
    margin: 0 0 10px;
    color: var(--color-text-muted);
    font-size: 14px;
    text-align: center;
  }

  &__filters-panel-submit {
    width: 100%;
    min-height: 48px;
    border: none;
    border-radius: var(--radius-md);
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  &__filters-panel-submit:hover,
  &__filters-panel-submit:focus-visible {
    background-color: var(--color-accent-strong);
  }

  &__filter-mode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-lg);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }

  &__filter-mode-content {
    min-width: 0;
  }

  &__filter-mode-title {
    margin: 0 0 4px;
    color: var(--color-text-main);
    font-size: 15px;
    font-weight: 700;
  }

  &__filter-mode-text {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 13px;
    line-height: 1.4;
  }

  &__filter-mode-button {
    flex-shrink: 0;
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid var(--color-border-soft);
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  &__filter-mode-button:hover,
  &__filter-mode-button:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  &__filter-mode-button--active {
    border-color: var(--color-accent);
    background-color: var(--color-accent);
    color: var(--color-surface);
  }

  &__filter-mode-button--active:hover,
  &__filter-mode-button--active:focus-visible {
    border-color: var(--color-accent-strong);
    background-color: var(--color-accent-strong);
    color: var(--color-surface);
  }

  &__filter-group {
    padding: 16px;
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-lg);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }

  &__filter-title {
    margin: 0 0 12px;
    color: var(--color-text-main);
    font-size: 15px;
    font-weight: 700;
  }

  &__filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__filter-list--inside {
    padding: 0 16px 16px;
  }

  &__filter-chip {
    padding: 8px 12px;
    border: 1px solid var(--color-border-soft);
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text-body);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  &__filter-chip:hover,
  &__filter-chip:focus-visible {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  &__filter-chip:active {
    background-color: oklch(0.885 0 0);
  }

  &__filter-chip--active {
    border-color: var(--color-accent);
    background-color: var(--color-accent);
    color: var(--color-surface);
  }

  &__filter-chip--active:hover,
  &__filter-chip--active:focus-visible,
  &__filter-chip--active:active {
    border-color: var(--color-accent-strong);
    background-color: var(--color-accent-strong);
    color: var(--color-surface);
  }

  &__dropdown-filters {
    display: grid;
    gap: 10px;
  }

  &__filter-dropdown {
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-lg);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }

  &__filter-summary {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 16px;
    color: var(--color-text-main);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    list-style: none;
  }

  &__filter-summary::-webkit-details-marker {
    display: none;
  }

  &__filter-summary::after {
    content: "↓";
    color: var(--color-text-muted);
    font-size: 16px;
    transition: transform var(--duration-fast)
      var(--ease-standard);
  }

  &__filter-dropdown[open] &__filter-summary::after {
    transform: rotate(180deg);
  }

  &__filter-summary-main {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  &__filter-summary-count {
    min-width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    border-radius: 999px;
    background-color: var(--color-accent);
    color: var(--color-surface);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  &__count {
    margin: 0 auto 24px;
    color: var(--color-text-muted);
    font-size: 14px;
    text-align: center;
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

    &__filter-bar {
      max-width: 100%;
      align-items: stretch;
      flex-direction: column;
    }

    &__filter-open,
    &__filter-bar-reset {
      width: 100%;
    }

    &__filter-bar-text {
      text-align: center;
    }

    &__filters-panel {
      width: 100%;
    }

    &__filter-mode {
      align-items: stretch;
      flex-direction: column;
    }

    &__filter-mode-button {
      width: 100%;
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
