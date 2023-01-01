module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  ignorePatterns: ['project/*', 'misc/*', 'dist/*', 'superfast/*'],
  plugins: ['@typescript-eslint'],
  rules: {
    eqeqeq: ['off'],
    'max-len': ['error', { code: 120 }],
    'arrow-body-style': ['off'],
    'no-param-reassign': ['off'],
    'no-bitwise': ['warn'],
    'react/jsx-props-no-spreading': ['off'],
    'import/prefer-default-export': ['warn'],
    'prefer-destructuring': ['off'],
    'global-require': ['off'],
    'react/prop-types': ['off'],
    'import/no-dynamic-require': ['off'],
    'max-classes-per-file': ['off'],
    'no-plusplus': ['off'],
    'import/no-cycle': ['off'],
    '@typescript-eslint/lines-between-class-members': ['off'],
    '@typescript-eslint/no-shadow': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    'jsx-a11y/label-has-associated-control': ['off'],
    'jsx-a11y/click-events-have-key-events': ['off'],
    'jsx-a11y/no-static-element-interactions': ['off'],
    'react/no-unescaped-entities': ['off'],
    'react/destructuring-assignment': ['off'],
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
