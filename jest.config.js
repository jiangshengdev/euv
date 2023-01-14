module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'esnext',
          sourceMap: true
        }
      }
    ]
  },
  globals: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: require('./package.json').version,
    __BROWSER__: false,
    __GLOBAL__: false,
    __ESM_BUNDLER__: true,
    __ESM_BROWSER__: false,
    __NODE_JS__: true,
    __SSR__: true,
    __FEATURE_OPTIONS_API__: true,
    __FEATURE_SUSPENSE__: true,
    __FEATURE_PROD_DEVTOOLS__: false,
    __COMPAT__: true
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/runtime-test/src/utils/**',
    '!packages/template-explorer/**',
    '!packages/sfc-playground/**',
    '!packages/size-check/**',
    '!packages/runtime-core/src/profiling.ts',
    '!packages/runtime-core/src/customFormatter.ts',
    // DOM transitions are tested via e2e so no coverage is collected
    '!packages/runtime-dom/src/components/Transition*',
    // only called in browsers
    '!packages/uv/src/devCheck.ts',
    // only used as a build entry
    '!packages/uv/src/runtime.ts',
    // mostly just entries
    '!packages/uv-compat/**'
  ],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '@uv/consolidate': '@uv/consolidate',
    '@uv/compat': '<rootDir>/packages/uv-compat/src',
    '^@uv/(.*?)$': '<rootDir>/packages/$1/src',
    'uv/compiler-sfc': '<rootDir>/packages/compiler-sfc/src',
    'uv/server-renderer': '<rootDir>/packages/server-renderer/src',
    uv: '<rootDir>/packages/uv/src'
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: process.env.SKIP_E2E
    ? // ignore example tests on netlify builds since they don't contribute
      // to coverage and can cause netlify builds to fail
      ['/node_modules/', '/examples/__tests__']
    : ['/node_modules/']
}
