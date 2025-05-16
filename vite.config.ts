import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});