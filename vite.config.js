import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
  // Use relative paths so the app works when deployed to GitHub Pages
  // whether the site is served from a repo subpath or the root.
  base: './',
})
