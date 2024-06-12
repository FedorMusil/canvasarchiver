import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': '/',
        },
    },
    server: {
        port: 3000,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setupTests.ts',
    },
});
