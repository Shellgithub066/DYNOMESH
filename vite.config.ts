import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
