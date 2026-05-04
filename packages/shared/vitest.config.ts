import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    // setupFiles: ["dotenv/config"],
    // alias: {
    //   "@/": new URL("./src/", import.meta.url).pathname,
    // },
  },
});
