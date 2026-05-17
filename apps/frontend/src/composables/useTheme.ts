import { computed, ref } from "vue";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

const currentTheme = ref<Theme>("light");

function getSystemTheme(): Theme {
  const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDarkTheme ? "dark" : "light";
}

function getSavedTheme(): Theme | null {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return null;
}

function applyTheme(theme: Theme) {
  currentTheme.value = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function initTheme() {
  const savedTheme = getSavedTheme();
  const initialTheme = savedTheme ?? getSystemTheme();

  applyTheme(initialTheme);
}

export function useTheme() {
  const isDarkTheme = computed(() => currentTheme.value === "dark");

  function toggleTheme() {
    const nextTheme: Theme = isDarkTheme.value ? "light" : "dark";

    applyTheme(nextTheme);
  }

  return {
    currentTheme,
    isDarkTheme,
    toggleTheme,
  };
}