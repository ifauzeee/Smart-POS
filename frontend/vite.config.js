// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        hmr: {
            overlay: true, // Keep error overlay enabled
        },
    },
    build: {
        sourcemap: false, // Disable source maps in production
    },
    optimizeDeps: {
        esbuildOptions: {
            sourcemap: false, // Disable source maps for optimized dependencies
        },
    },
});