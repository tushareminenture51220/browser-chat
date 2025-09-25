import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/main.jsx"),
      name: "ChatWidget",
      fileName: (format) => `chat-widget.${format}.js`,
    },
    rollupOptions: {
      // Include React in the bundle so it works standalone
      external: [],
    },
  },
});
