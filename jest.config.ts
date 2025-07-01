// jest.config.ts
import nextJest from 'next/jest.js';      // comes from the "next" package

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  // jsdom gives us DOM + JSX
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // path alias so "@/components/..." works
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // ignore generated & build folders for coverage
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/drizzle/'],
});
