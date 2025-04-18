module.exports = {
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/external-module-folders': ['node_modules'],
  },
  plugins: ['prettier', '@typescript-eslint', '@atlaskit/design-system'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './ui/tsconfig.json'],
      },
      rules: {
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
  rules: {
    'max-len': [
      'warn',
      {
        code: 120,
      },
    ],
    'import/extensions': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'no-await-in-loop': 'off', // https://softwareteams.atlassian.net/browse/COMPASS-2945
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      },
    ],
    'import/no-unresolved': 'off', // https://softwareteams.atlassian.net/browse/COMPASS-2948
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        jsxSingleQuote: true,
        printWidth: 120,
      },
    ],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    '@atlaskit/design-system/ensure-design-token-usage': [
      'error',
      { domains: ['color'], shouldEnforceFallbacks: true },
    ],
    '@atlaskit/design-system/no-deprecated-imports': 'off',
  },
};
