import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Corrige rutas relativas
  build: {
    outDir: "dist", // Asegura que la carpeta de salida sea la correcta
  },
});
