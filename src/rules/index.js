/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const LineLength = require('./line-length');
const ShortSections = require('./short-sections');
const Grouped = require('./grouped');
const NoArticles = require('./no-articles');
const Command = require('./command');
const Frontmatter = require('./frontmatter');

module.exports = () => [
  new Grouped(),
  new ShortSections(),
  new LineLength(80),
  new NoArticles(),
  new Command(),
  new Frontmatter(
    'SKILL.md',
    ['name', 'description'],
    ['name', 'description', 'license', 'allowed-tools']
  )
];
