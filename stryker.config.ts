import type { Config } from '@stryker-mutator/api/core';

const config: Config = {
  testRunner: 'vitest',
  mutate: [
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/lib/db/seed.ts',
    '!src/**/*.d.ts',
  ],
  thresholds: {
    high: 80,
    low: 75,
    break: 60,
  },
  coverageAnalysis: 'perTest',
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'reports/mutation/html/index.html',
  },
  vitest: {
    configFile: 'vitest.config.ts',
  },
};

export default config;
