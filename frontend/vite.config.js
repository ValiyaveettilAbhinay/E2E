import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // Vite finds postcss.config.cjs automatically, 
  // so the 'css' block can usually be removed unless you have custom needs.
});