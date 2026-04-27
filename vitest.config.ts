import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['app/lib/**/*.ts'],
      exclude: ['app/lib/__tests__/**', 'app/lib/posthog.ts'],
      thresholds: { lines: 90, functions: 90 },
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['app/lib/__tests__/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['app/components/__tests__/**/*.test.tsx'],
          setupFiles: ['app/components/__tests__/setup.ts'],
          globals: true,
        },
      },
    ],
  },
})
