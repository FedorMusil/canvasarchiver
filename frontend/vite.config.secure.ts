import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, './localhost.pem')),
        },
        port: 3000,
        cors: {
            origin: '*', // Allow all origins, needs to be changed later.
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setupTests.ts',
    },
});
