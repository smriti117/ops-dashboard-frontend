import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy to Django so there is no CORS setup and the WebSocket is same-origin.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8000", "/ws": { target: "ws://localhost:8000", ws: true } } },
});
