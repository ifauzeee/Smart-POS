import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/products'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'api-products-cache',
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Hari
                            },
                        },
                    },
                ]
            },
            manifest: {
                name: 'Smart POS',
                short_name: 'SmartPOS',
                description: 'Aplikasi Point of Sale Modern',
                theme_color: '#9D4EDD',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    // --- PERUBAHAN DI SINI ---
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js', // Baris ini ditambahkan kembali
    },
    // --- AKHIR PERUBAHAN ---
    server: {
        hmr: {
            overlay: true,
        },
    },
    build: {
        sourcemap: false,
    },
    optimizeDeps: {
        esbuildOptions: {
            sourcemap: false,
        },
    },
});