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
 * or temporal adverb without reading the word as language. The prompt
 * hands that subtler clause-counting to the AI oracle, which weighs the
 * full sentence before judging a line as multi-instruction.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  prompt() {
    return `${this.id}: flag any line that carries more than one instruction, counting distinct clauses whether or not a semicolon, "and", or "then" welds them, yet never count a coordinated object or noun phrase trailing "and" or "then" as a second instruction`;
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
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trimEnd();
    const masked = clean.replace(/\b(?:e\.g|i\.e|etc)\./giu, (match) => match.replace(/\./gu, ' '));
    if (!/[.!?]\s+\S/u.test(masked) && !/;/u.test(masked)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line carries more than one instruction',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Atomic;
