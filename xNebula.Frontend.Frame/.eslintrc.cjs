module.exports = {
  root: true,
  env: {
    browser: true, // 涵盖浏览器全局变量
    node: true, // 涵盖node全局变量
  },
  globals: {
    __VERSION__: true,
  },
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: {
      js: 'espree',
      jsx: 'espree',
      cjs: 'espree',
      mjs: 'espree',
      ts: require.resolve('@typescript-eslint/parser'),
      tsx: require.resolve('@typescript-eslint/parser'),
      cts: require.resolve('@typescript-eslint/parser'),
      mts: require.resolve('@typescript-eslint/parser'),
    },
  },
  rules: {
    'prettier/prettier': 'warn',
    // 未使用的变量处理
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // 函数内定义了与函数外相同的变量
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    // 使用未声明的变量
    'no-undef': 'warn',
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'warn',
  },
};
