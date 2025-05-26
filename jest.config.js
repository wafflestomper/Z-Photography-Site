/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/scripts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/scripts/$1',
  },
  setupFiles: ['<rootDir>/scripts/instagram-v2/__tests__/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1
}; 