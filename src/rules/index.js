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
const Budget = require('./budget');
const DescriptionTriggers = require('./description-triggers');
const Atomic = require('./atomic');
const Hedging = require('./hedging');
const Passive = require('./passive');
const Unique = require('./unique');
const Consistent = require('./consistent');
const Simple = require('./simple');
const SectionLevel = require('./section-level');
const Format = require('./format');
const Untrusted = require('./untrusted');
const Ordered = require('./ordered');
const Emphasis = require('./emphasis');
const Persona = require('./persona');
const Concise = require('./concise');
const Example = require('./example');
const Referential = require('./referential');
const Vague = require('./vague');
const Positive = require('./positive');
const Done = require('./done');
const Terms = require('./terms');
const Jargon = require('./jargon');
const PseudoHeading = require('./pseudo-heading');
const Stale = require('./stale');
const ToolClarity = require('./tool-clarity');
const CounterExample = require('./counter-example');
const Rationale = require('./rationale');
const SelfContained = require('./self-contained');
const Quantifier = require('./quantifier');
const WeakVerb = require('./weak-verb');
const Default = require('./default');
const MetaReference = require('./meta-reference');
const AmbiguousOr = require('./ambiguous-or');
const ExternalLink = require('./external-link');
const Conditional = require('./conditional');
const Transition = require('./transition');
const Placement = require('./placement');
const InlineCode = require('./inline-code');
const Emoji = require('./emoji');
const Homoglyph = require('./homoglyph');
const DuplicateSection = require('./duplicate-section');

module.exports = () => [
  new Grouped(),
  new Empty(),
  new ShortSections(),
  new SectionLevel(),
  new LineLength(80),
  new TokenCount(4000),
  new Concise(200),
  new NoArticles(),
  new Command(),
  new Punctuation(),
  new DeadImport(),
  new Redundant(),
  new Consistent(),
  new Simple(),
  new Referential(),
  new NameMatchesDir(),
  new Polite(),
  new Unfinished(),
  new Crowded(10),
  new Budget(60),
  new DescriptionTriggers(),
  new Example(),
  new Format(),
  new Atomic(),
  new Ordered(),
  new Hedging(),
  new Vague(),
  new ToolClarity(),
  new Passive(),
  new Untrusted(),
  new Emphasis(),
  new Persona(),
  new Positive(),
  new Done(),
  new Terms(),
  new Jargon(),
  new PseudoHeading(),
  new Stale(),
  new CounterExample(),
  new Rationale(),
  new SelfContained(),
  new Quantifier(),
  new WeakVerb(),
  new Default(),
  new MetaReference(),
  new AmbiguousOr(),
  new ExternalLink(),
  new Conditional(),
  new Transition(),
  new Placement(),
  new InlineCode(),
  new Emoji(),
  new Homoglyph(),
  new DuplicateSection(),
  new Unique(),
  new Frontmatter(
    'SKILL.md',
    ['name', 'description'],
    ['name', 'description', 'license', 'allowed-tools']
  ),
  new NameFormat()
];
