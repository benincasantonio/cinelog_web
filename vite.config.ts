import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Features
      "@Auth": path.resolve(__dirname, "./src/features/auth"),
      "@Movies": path.resolve(__dirname, "./src/features/movies"),
    },
  },
});
