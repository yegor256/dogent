/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const LineLength = require('./line-length');
const TokenCount = require('./token-count');
const ShortSections = require('./short-sections');
const Grouped = require('./grouped');
const Empty = require('./empty');
const NoArticles = require('./no-articles');
const Command = require('./command');
const Punctuation = require('./punctuation');
const Frontmatter = require('./frontmatter');
const NameFormat = require('./name-format');
const DeadImport = require('./dead-import');
const Redundant = require('./redundant');
const NameMatchesDir = require('./name-matches-dir');
const Polite = require('./polite');
const Consistent = require('./consistent');
const Simple = require('./simple');

module.exports = () => [
  new Grouped(),
  new Empty(),
  new ShortSections(),
  new LineLength(80),
  new TokenCount(4000),
  new NoArticles(),
  new Command(),
  new Punctuation(),
  new DeadImport(),
  new Redundant(),
  new Consistent(),
  new Simple(),
  new NameMatchesDir(),
  new Polite(),
  new Frontmatter(
    'SKILL.md',
    ['name', 'description'],
    ['name', 'description', 'license', 'allowed-tools']
  ),
  new NameFormat()
];
