// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './reports/test-report.html',
    },
    include: ['tests/**/*.test.js'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './reports/coverage',
    },
  },
});
