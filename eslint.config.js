/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const {configs} = require('@eslint/js');

module.exports = [
  {ignores: ['node_modules/']},
  {
    ...configs.all,
    files: ['**/*.js'],
    languageOptions: {ecmaVersion: 2022, sourceType: 'commonjs'},
    rules: {
      ...configs.all.rules,
      'camelcase': 'off',
      'capitalized-comments': 'off',
      'class-methods-use-this': 'off',
      'complexity': 'off',
      'consistent-return': 'off',
      'consistent-this': 'off',
      'default-param-last': 'off',
      'func-names': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'indent': ['error', 2, {SwitchCase: 1}],
      'init-declarations': 'off',
      'max-classes-per-file': 'off',
      'max-len': ['error', {code: 100}],
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'multiline-comment-style': 'off',
      'no-console': 'off',
      'no-continue': 'off',
      'no-else-return': 'off',
      'no-inline-comments': 'off',
      'no-invalid-this': 'off',
      'no-lonely-if': 'off',
      'no-magic-numbers': 'off',
      'no-negated-condition': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-process-exit': 'off',
      'no-shadow': 'off',
      'no-sync': 'off',
      'no-ternary': 'off',
      'no-undef': 'off',
      'no-undefined': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-warning-comments': 'off',
      'one-var': 'off',
      'prefer-arrow-callback': 'off',
      'prefer-destructuring': 'off',
      'prefer-named-capture-group': 'off',
      'require-await': 'off',
      'require-unicode-regexp': 'off',
      'sort-keys': 'off',
      'sort-vars': 'off',
      'strict': 'off'
    }
  }
];
