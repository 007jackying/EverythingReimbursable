module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup-components.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native$': 'react-native-web',
    'react-native/Libraries/StyleSheet/StyleSheet': 'react-native-web/dist/StyleSheet',
    'react-native/Libraries/Text/Text': 'react-native-web/dist/Text',
    'react-native/Libraries/View/View': 'react-native-web/dist/View'
  },
  testMatch: ['<rootDir>/test/components/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/*.tsx',
    '!src/types/**/*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000
}