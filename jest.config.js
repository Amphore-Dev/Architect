module.exports = {
  preset: 'ts-jest',
  "transform": {
          "^.+\\.(t|j)s?$": "ts-jest"
      },
  testEnvironment: 'node',
  // exclude dist folder
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/example/', '<rootDir>/src/tests/TESTS_SRC/'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/blueprints/**/*'],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
