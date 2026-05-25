import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import RecipeDetailsView from "@/views/RecipeDetailsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/recipes/:slug",
      name: "recipe-details",
      component: RecipeDetailsView,
    },
  ],
});

export default router;
