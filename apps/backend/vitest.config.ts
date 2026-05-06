import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
          setupFiles: ["dotenv/config"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts"],
          setupFiles: ["dotenv/config", "src/__tests__/mongo-setup.ts"],
        },
      },
    ],
  },
});
