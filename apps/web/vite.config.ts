import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const isUserOrOrgPages = repositoryName?.toLowerCase().endsWith(".github.io");
  const base =
    process.env.VITE_BASE_PATH ??
    (process.env.GITHUB_ACTIONS === "true" && repositoryName
      ? isUserOrOrgPages
        ? "/"
        : `/${repositoryName}/`
      : "/");

  return {
    base,
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.2.0")
    },
    resolve: {
      alias: {
        "@pizza-geek/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url))
      }
    },
    server: {
      port: 5173
    }
  };
});
