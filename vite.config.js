import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Use classic runtime for UMD build
      jsxRuntime: "classic",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // now "@/..." points to src
      "@context": path.resolve(__dirname, "src/context"), // shortcut for context
      "@components": path.resolve(__dirname, "src/components"), // optional
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.jsx"),
      name: "ChatWidget",
      fileName: (format) => `chat-widget.${format}.js`,
      formats: ["umd"],
    },
    outDir: "dist",
    minify: "esbuild",
    rollupOptions: {
      external: [], // bundle React inside for UMD or use globals
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
