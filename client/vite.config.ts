import { fileURLToPath, URL } from "node:url";
import compression from "compression";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Connect, type Plugin } from "vite";

/**
 * Gzip the dev server's responses.
 *
 * Vite serves dependency pre-bundles uncompressed, which is fine over
 * loopback but costly when the app is previewed through a remote sandbox
 * proxy: the dependency graph is megabytes of plain JavaScript, and an
 * unbundled dev server sends all of it on first load. Compressing cuts the
 * transfer several-fold and is what keeps a cold preview inside a headless
 * browser's navigation budget.
 */
function devCompression(): Plugin {
  const middleware = compression();
  return {
    name: "dev-compression",
    apply: "serve",
    configureServer(server) {
      // compression is typed against Express, but it only ever touches the
      // raw http request and response that connect also passes.
      server.middlewares.use(middleware as unknown as Connect.NextHandleFunction);
    },
  };
}

export default defineConfig({
  plugins: [devCompression(), react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  css: {
    /**
     * Tailwind runs through its Vite plugin, so no PostCSS file is needed.
     * Declaring an empty config stops Vite searching parent directories and
     * adopting an unrelated postcss.config.js from outside the repo.
     */
    postcss: { plugins: [] },
  },
  optimizeDeps: {
    /**
     * The dependency set is fixed and known, so pre-bundle it in a single pass
     * at startup. Left to discover dependencies lazily while crawling routes,
     * Vite restarts its optimiser mid-load and the in-flight requests for the
     * superseded bundle hash never resolve — the page then never finishes
     * loading, which a headless verification browser reads as a blank app.
     */
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "lucide-react",
      "radix-ui",
      "sonner",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },
  server: {
    /**
     * The builder previews this app from a sandbox behind a proxy that serves
     * it on a generated hostname, so the dev server must listen on every
     * interface and accept a Host header it has never seen before.
     */
    host: true,
    allowedHosts: true,
    port: 5173,
    /**
     * The API is proxied rather than called cross-origin so the session cookie
     * is same-site in development; production points VITE_API_URL at the API.
     */
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
