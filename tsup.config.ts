import { defineConfig } from 'tsup';

export default defineConfig({
  // Same three entries as @qualflare/webdriverio. Its package is a dependency,
  // so tsup leaves it external: the reporter and runtime that load at run time
  // are that package's own, never a bundled second copy with a second state.
  entry: { index: 'src/index.ts', service: 'src/service.ts', runtime: 'src/runtime.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  splitting: false,
  shims: false,
});
