import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'miniflare',
    globals: true,
    include: ['worker/__tests__/**/*.test.ts']
  }
})
