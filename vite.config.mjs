import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "health-check",
      configureServer(server) {
        server.middlewares.use("/cron/health", (req, res) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, timestamp: Date.now() }));
        });
      },
    },
  ],
  server: {
    port: process.env.PORT || 3000,
    strictPort: true,
    host: true, // Listen on all local IPs (needed for Render)
    open: true,
    proxy: {
      // Proxy all /api requests to your backend server
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        // optionally preserve host header
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      // Proxy error test route
      "/trigger-error": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
