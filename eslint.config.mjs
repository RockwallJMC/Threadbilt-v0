import nextVitals from 'eslint-config-next/core-web-vitals';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const eslintConfig = [
  // Use Next.js native flat config
  ...nextVitals,

  // Global ignores
  {
    ignores: ['.next', 'dist', 'coverage', 'prototypes', 'templates', '.claude'],
  },

  // Project-specific rules
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'no-control-regex': 0,
      'react-refresh/only-export-components': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off',
      'import/no-webpack-loader-syntax': 'off',
      'jsx-a11y/alt-text': 'off',
      'import/no-anonymous-default-export': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'off',
    },
  },
];

export default eslintConfig;
