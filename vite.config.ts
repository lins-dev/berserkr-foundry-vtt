import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/module/berserkr.ts'),
      name: 'berserkr',
      formats: ['es'],
      fileName: 'berserkr'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'berserkr.css';
          return assetInfo.name;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@module': path.resolve(__dirname, './src/module'),
      '@svelte': path.resolve(__dirname, './src/svelte')
    }
  }
});
