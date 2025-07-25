import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";

// Ensure proper type assertion and plugin list declaration
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [
    react(),
    ...(mode === "development" ? [componentTagger()] : []),
  ];

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
