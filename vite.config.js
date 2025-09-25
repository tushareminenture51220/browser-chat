// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.jsx"),
      name: "EmbChatWidget",
      formats: ["iife"],
      fileName: () => "emb-chat-widget.js"
    },
    rollupOptions: {
      // Keep empty to bundle react/react-dom into the final file (good for embedding into non-React sites)
      external: []
    }
  }
});
