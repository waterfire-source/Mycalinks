//@ts-expect-error becuase of because of
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node', // or 'jsdom' if DOMが必要なテストなら
    globals: true,
    include: ['src/app/api/**/route.test.ts'],
    testTimeout: 60000,
    setupFiles: ['./src/api/backendApi/test/vitest.setup.ts'],
    maxWorkers: 5,
    reporters: 'verbose',
    minWorkers: 1,
  },
});
