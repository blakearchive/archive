module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testMatch: [
    '<rootDir>/blakearchive/static/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    '<rootDir>/blakearchive/static/**/*.ts',
    '!<rootDir>/blakearchive/static/**/*.spec.ts',
    '!<rootDir>/blakearchive/static/**/*.d.ts',
    '!<rootDir>/blakearchive/static/**/index.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@angular|rxjs|zone.js))'
  ],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  }
};