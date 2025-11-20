import next from 'eslint-config-next';

const project = process.env.ESLINT_TSCONFIG ?? 'tsconfig.json';

const config = [
  {
    ignores: [
      '.contentlayer/**',
      '.next/**',
      'node_modules/**',
      'dist/**',
      'out/**',
      'build/**',
    ],
  },
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project,
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/error-boundaries': 'off',
    },
  },
];

export default config;
