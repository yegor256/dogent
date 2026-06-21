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
 * full sentence before judging a line as multi-instruction. A
 * deterministic guard then drops any oracle flag on a line that bears no
 * welding token at all, since a lone imperative cannot hold two
 * instructions without a semicolon, a mid-line terminator, or an "and"
 * or "then" to weld the second clause on.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  hint() {
    return 'Split a line that bundles several instructions into one line per instruction, since the agent reads each line as a single command and welded clauses get half-followed.';
  }
  prompt() {
    return `${this.id}: flag any line that carries more than one instruction, counting distinct clauses whether or not a semicolon, "and", or "then" welds them, yet never count a coordinated object or noun phrase trailing "and" or "then" as a second instruction; read the first word as the lone imperative and treat everything after it as that single verb's object, so a leading imperative trailed only by a coordinated object or Oxford-comma list stays one instruction even when a list item embeds its own verb, as in "Cover bug, why it is wrong, and proposed fix", which is the single order "cover" taking a three-part object, not several instructions`;
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
  suppress(violation, document) {
    if (violation.rule !== this.id) {
      return false;
    }
    const lines = document.text().split('\n');
    return !this.welds(lines[violation.spot.line() - 1] || '');
  }
  splits(text) {
    const masked = this.mask(text);
    return /[.!?]\s+\S/u.test(masked) || /;/u.test(masked);
  }
  welds(text) {
    return this.splits(text) || /\b(?:and|then)\b/iu.test(this.mask(text));
  }
  mask(text) {
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trimEnd();
    return clean.replace(/\b(?:e\.g|i\.e|etc)\./giu, (match) => match.replace(/\./gu, ' '));
  }
}

module.exports = Atomic;
