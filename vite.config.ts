import { defineConfig } from "vite";

export default defineConfig({
	// Expose MAPTILER_* variables (from .env or the shell) to client code via import.meta.env
	envPrefix: ["VITE_", "MAPTILER_"],
});
