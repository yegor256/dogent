/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const LineLength = require('./line-length');
const ShortSections = require('./short-sections');
const Grouped = require('./grouped');
const NoArticles = require('./no-articles');
const Command = require('./command');

module.exports = () => [
  new Grouped(),
  new ShortSections(),
  new LineLength(80),
  new NoArticles(),
  new Command()
];
