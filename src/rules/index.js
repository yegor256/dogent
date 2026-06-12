/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const LineLength = require('./line-length');
const TokenCount = require('./token-count');
const ShortSections = require('./short-sections');
const Grouped = require('./grouped');
const NoArticles = require('./no-articles');
const Command = require('./command');
const Punctuation = require('./punctuation');
const Frontmatter = require('./frontmatter');

module.exports = () => [
  new Grouped(),
  new ShortSections(),
  new LineLength(80),
  new TokenCount(4000),
  new NoArticles(),
  new Command(),
  new Punctuation(),
  new Frontmatter(
    'SKILL.md',
    ['name', 'description'],
    ['name', 'description', 'license', 'allowed-tools']
  )
];
