module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx)',
    '<rootDir>/src/**/?(*.)(test|spec).(js|jsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.(js|jsx)',
    '!src/index.js',
    '!src/main.jsx',
    '!src/**/*.stories.(js|jsx)',
    '!src/setupTests.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
}