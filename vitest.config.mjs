// vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/scripts/__tests__/**/*.test.mjs'],
  },
});
