import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    allowedHosts: [
      'notefiber.autovoid.cyou',
      '.autovoid.cyou', // Wildcard untuk semua subdomain
      'localhost',
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@admin": path.resolve(__dirname, "./src/admin")
    },
    dedupe: ['react', 'react-dom'],
  },
})