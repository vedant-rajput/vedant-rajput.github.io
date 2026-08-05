import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three-stdlib"],
          rapier: ["@dimforge/rapier3d-compat"],
          gsap: ["gsap"],
        },
      },
    },
  },
});
