module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src']
        ]
      }
    },
  },
  rules: {
    'object-curly-newline': 'off',
    'object-shorthand': 'off',
    'no-unused-expressions': ["error", { "allowShortCircuit": true }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-param-reassign': 'off',
    'no-return-await': 'off',
    'prefer-destructuring': 'off',
  },
};
