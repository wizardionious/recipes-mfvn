import { createRouter, createWebHistory } from "vue-router";
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: 72,
        behavior: "smooth",
      };
    }

    return {
      top: 0,
    };
  },
});

if (import.meta.hot) { 
  handleHotUpdate(router) 
} 

export default router;
