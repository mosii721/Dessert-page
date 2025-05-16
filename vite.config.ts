import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true 
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});



 