import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // vitest corre este archivo antes de todos los tests
    setupFiles: ["./vitest.setup.ts"],
  },
});