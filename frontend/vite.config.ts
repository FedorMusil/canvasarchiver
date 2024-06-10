import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './localhost.pem')),
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setupTests.ts',
    },
    port: 3000,
    cors: {
      // TODO: Change the cors origin to something safer
      origin: '*', // Allow all origins, or specify the exact origins you want to allow
    }
  }
});
