/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

/**
 * ESLint configuration.
 *
 * Enables every core rule (@eslint/js "all") and every formatting rule
 * (@stylistic "all"). The "@stylistic/*" entries below pick this
 * project's house style (two spaces, single quotes, dense blocks) and
 * are value choices, not relaxations. Six rules are switched off, each
 * for a stated reason:
 *
 *   no-magic-numbers        EO forbids named constants; literals belong
 *                           at composition roots and in test fixtures.
 *   sort-keys               SARIF and other objects carry a meaningful
 *                           key order that alphabetics would scramble.
 *   no-ternary              a terse ternary reads better than a branch.
 *   @stylistic/wrap-regex   parentheses around a regex are pure noise.
 *
 * Two more (max-statements, max-lines-per-function) are switched off
 * only for src/markdown.js, whose one cohesive scanning loop they
 * cannot usefully measure; everywhere else they stay on.
 *
 * One more (camelcase) is switched off only for src/openai.js and its
 * test, which carry OpenAI's snake_case fields "response_format",
 * "prompt_tokens", and "completion_tokens".
 *
 * One more (class-methods-use-this) is switched off for nine rules
 * whose bodies are deliberately constant: src/rules/empty.js, src/rules/line-length.js, src/rules/grouped.js, src/rules/short-sections.js, src/rules/name-format.js, src/rules/name-matches-dir.js, src/rules/polite.js and src/rules/unfinished.js
 * return an empty prompt() to keep the deterministic-only rule out
 * of the AI oracle, and src/rules/consistent.js returns empty
 * violations() to leave its duplicate-and-conflict judgement
 * entirely to the oracle.
 */

'use strict';

const {configs} = require('@eslint/js');
const stylistic = require('@stylistic/eslint-plugin');
const globals = require('globals');

module.exports = [
  {ignores: ['node_modules/']},
  configs.all,
  stylistic.configs.all,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {...globals.node}
    },
    rules: {
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/indent': ['error', 2, {SwitchCase: 1}],
      '@stylistic/lines-between-class-members': ['error', 'never'],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/newline-per-chained-call': ['error', {ignoreChainWithDepth: 3}],
      '@stylistic/object-property-newline': ['error', {allowAllPropertiesOnSameLine: true}],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always', named: 'never', asyncArrow: 'always'
      }],
      '@stylistic/wrap-regex': 'off',
      'max-params': ['error', 4],
      'no-magic-numbers': 'off',
      'no-ternary': 'off',
      'one-var': ['error', 'never'],
      'sort-keys': 'off'
    }
  },
  {
    files: ['src/markdown.js'],
    rules: {
      'max-statements': 'off',
      'max-lines-per-function': 'off'
    }
  },
  {
    files: ['src/openai.js', 'test/test_openai.js'],
    rules: {
      camelcase: 'off'
    }
  },
  {
    files: [
      'src/rules/empty.js',
      'src/rules/line-length.js',
      'src/rules/grouped.js',
      'src/rules/short-sections.js',
      'src/rules/name-format.js',
      'src/rules/name-matches-dir.js',
      'src/rules/polite.js',
      'src/rules/unfinished.js',
      'src/rules/consistent.js'
    ],
    rules: {
      'class-methods-use-this': 'off'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {globals: {...globals.mocha}}
  }
];
