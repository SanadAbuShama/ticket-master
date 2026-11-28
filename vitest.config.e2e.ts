import { defineConfig } from 'vitest/config';

export default defineConfig({
  // copy the `plugins` from your existing vitest.config.ts here (the SWC plugin Nest needs)
  test: {
    include: ['test/**/*.e2e.spec.ts'],
    globalSetup: ['test/global.setup.ts'],
    fileParallelism: false,
  },
});