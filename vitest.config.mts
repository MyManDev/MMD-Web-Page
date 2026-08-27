import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Playwright kendi kosucusuyla calisir; Vitest onu toplamasin.
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: { "@": new URL("./", import.meta.url).pathname },
  },
});
