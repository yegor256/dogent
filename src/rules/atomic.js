/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Atomic.
 *
 * Demands that every line carry exactly one instruction. A standalone
 * checker spots only the unambiguous signs: a sentence terminator
 * sitting mid-line with more text after it, or two clauses welded
 * together by a semicolon. An " and " or " then " is left alone, since
 * no suffix heuristic can tell a second verb from a coordinated object
 * or temporal adverb without reading the word as language.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  hint() {
    return 'Split a line that bundles several instructions into one line per instruction, since the agent reads each line as a single command and welded clauses get half-followed.';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.judge(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  judge(text, line, uri) {
    if (!this.splits(text)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line carries more than one instruction',
      new Region(uri, line, 1)
    )];
  }
  splits(text) {
    const masked = this.mask(text);
    return /[.!?]\s+\S/u.test(masked) || /;/u.test(masked);
  }
  mask(text) {
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trimEnd();
    return clean.replace(/\b(?:e\.g|i\.e|etc)\./giu, (match) => match.replace(/\./gu, ' '));
  }
}

module.exports = Atomic;
