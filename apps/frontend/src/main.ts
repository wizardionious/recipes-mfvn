import "@/assets/theme.scss"
import "./assets/main.css";

import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { initTheme } from "@/composables/useTheme";

initTheme();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
