import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [react(), visualizer({ template: 'sunburst' })],
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
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
