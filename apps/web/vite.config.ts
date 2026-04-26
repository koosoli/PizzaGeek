import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

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
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifestFilename: "site.webmanifest",
        includeAssets: ["favicon.svg", "og-card.svg", "icon-maskable.svg"],
        manifest: {
          name: "Pizza Geek",
          short_name: "Pizza Geek",
          description: "A style-aware dough calculator with fermentation planning, flour blending, bake logging, and offline recipe access.",
          theme_color: "#171717",
          background_color: "#12131a",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            {
              src: "favicon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any"
            },
            {
              src: "icon-maskable.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "maskable"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,ico,png,webmanifest}"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "app-pages"
              }
            },
            {
              urlPattern: ({ request }) => ["script", "style", "worker"].includes(request.destination),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "app-assets"
              }
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "app-images"
              }
            }
          ]
        }
      })
    ],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.3.0")
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
