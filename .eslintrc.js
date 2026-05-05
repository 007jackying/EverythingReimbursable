module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    // Prettier integration — all formatting is Prettier's job
    'prettier/prettier': 'error',

    // Enforce arrow functions over function declarations
    'func-style': ['error', 'expression'],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],

    // React 17+ new JSX transform — no need to import React
    'react/react-in-jsx-scope': 'off',

    // Allow JSX in .tsx and .jsx files
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.jsx'] }],

    // TypeScript handles this better than ESLint
    'no-use-before-define': 'off',
    // variables: false allows StyleSheet.create() at bottom of file (common RN pattern)
    '@typescript-eslint/no-use-before-define': ['error', { variables: false }],

    // TypeScript handles prop validation — defaultProps not needed
    'react/require-default-props': 'off',

    // Allow component definitions passed as props (e.g. tabBarIcon in React Navigation)
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

    // Metro bundler resolves extensions — no need to specify them
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never'
      }
    ],

    // Screens often use default exports
    'import/prefer-default-export': 'off',

    // @expo/vector-icons is bundled with Expo SDK — not explicitly in package.json
    'import/no-extraneous-dependencies': 'off',

    // Removed in @typescript-eslint v6 — suppress "rule not found" errors
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-throw-literal': 'off',

    // React Native uses Alert.alert() — suppress global alert() warning
    'no-alert': 'off',

    // Console statements - warn in development
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Prefer const for variables that don't change
    'prefer-const': ['error', { destructuring: 'all' }],

    // Disallow var
    'no-var': 'error',

    // Require template literals instead of string concatenation
    'prefer-template': 'error',

    // Disallow unnecessary return await
    'no-return-await': 'error',

    // Require await in async functions that return promises
    'require-await': 'error',

    // Enforce consistent return in async functions
    'no-return-assign': ['error', 'except-parens']
  },
  overrides: [
    {
      // Test files - allow console.log
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      // Config files - allow CommonJS
      files: ['*.js', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
}
