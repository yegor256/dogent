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
const Unfinished = require('./unfinished');
const Crowded = require('./crowded');
const DescriptionTriggers = require('./description-triggers');
const Atomic = require('./atomic');
const Hedging = require('./hedging');
const Passive = require('./passive');
const Unique = require('./unique');
const Consistent = require('./consistent');
const Simple = require('./simple');
const SectionLevel = require('./section-level');
const Persona = require('./persona');

module.exports = () => [
  new Grouped(),
  new Empty(),
  new ShortSections(),
  new SectionLevel(),
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
  new Unfinished(),
  new Crowded(10),
  new DescriptionTriggers(),
  new Atomic(),
  new Hedging(),
  new Passive(),
  new Persona(),
  new Unique(),
  new Frontmatter(
    'SKILL.md',
    ['name', 'description'],
    ['name', 'description', 'license', 'allowed-tools']
  ),
  new NameFormat()
];
