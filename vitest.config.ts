import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@pizza-geek/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      "@pizza-geek/core/": fileURLToPath(new URL("./packages/core/src/", import.meta.url))
    }
  }
});
