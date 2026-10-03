import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts', 'test/integration/*.test.ts', 'test/built/*.test.ts'],
    // The fixture project's specs are run by the child `wdio` process the
    // integration suite spawns, never by this one.
    exclude: ['**/node_modules/**', 'test/integration/fixtures/**'],
  },
});
