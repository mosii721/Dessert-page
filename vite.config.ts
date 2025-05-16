import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../dist',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});