module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint'), 'standard'],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'no-console': 'off',
    'no-shadow': 'off',
    'prefer-destructuring': 'off',
    'no-return-await': 'off',
    'space-before-blocks': 'on',
  },
};
