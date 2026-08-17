import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite config: React + Tailwind v4 (CSS-first, configured in src/index.css)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
