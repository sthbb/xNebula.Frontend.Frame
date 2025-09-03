/* eslint-env node */
module.exports = {
  root: true,
  globals: {
    __VERSION__: true,
    __dirname: true,
    __filename: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
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
  parserOptions: {
    ecmaVersion: 'latest',
  },
};
