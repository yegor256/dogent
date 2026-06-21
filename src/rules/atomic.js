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
 * second clause: a lone imperative without a semicolon or mid-line
 * terminator holds one instruction, and so does a leading imperative whose
 * only "and" or "then" precedes a coordinated object rather than a second
 * verb. The guard reads a second verb only where the word after "and" or
 * "then" itself takes a determiner-led object, so "and note the evidence"
 * survives while "and proposed fix" is vetoed. The same guard drops any
 * oracle flag landing inside the YAML frontmatter, whose description is a
 * third-person capability statement the deterministic side never inspects.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  hint() {
    return 'Split a line that bundles several instructions into one line per instruction, since the agent reads each line as a single command and welded clauses get half-followed.';
  }
  prompt() {
    return `${this.id}: flag any line that carries more than one instruction, counting distinct clauses whether or not a semicolon, "and", or "then" welds them, yet never count a coordinated object or noun phrase trailing "and" or "then" as a second instruction; read the first word as the lone imperative and treat everything after it as that single verb's object, so a leading imperative trailed only by a coordinated object or Oxford-comma list stays one instruction even when a list item embeds its own verb, as in "Cover bug, why it is wrong, and proposed fix", which is the single order "cover" taking a three-part object, not several instructions; never flag a line inside the YAML frontmatter, whose description is a third-person capability statement that names several actions in one sentence`;
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
    const line = violation.spot.line();
    if (line <= this.frontmatter(document)) {
      return true;
    }
    const text = document.text().split('\n')[line - 1] || '';
    if (this.splits(text)) {
      return false;
    }
    return !this.clause(text);
  }
  frontmatter(document) {
    return document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys, row, last) => [last]
    })[0] || 0;
  }
  splits(text) {
    const masked = this.mask(text);
    return /[.!?]\s+\S/u.test(masked) || /;/u.test(masked);
  }
  clause(text) {
    const masked = this.mask(text);
    const welds = (masked.match(/\b(?:and|then)\b/giu) || []).length;
    if (welds !== 1) {
      return welds > 1;
    }
    const tail = /\b(?:and|then)\s+\S+\s+(?<next>\S+)/iu.exec(masked);
    return tail !== null && this.determiner(tail.groups.next);
  }
  determiner(word) {
    const clean = word.replace(/[^a-z]/giu, '').toLowerCase();
    return /^(?:the|a|an|this|that|these|those|its|his|her|their|our|my|your|every|each|all|any|some|no)$/u.test(clean);
  }
  mask(text) {
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trimEnd();
    return clean.replace(/\b(?:e\.g|i\.e|etc)\./giu, (match) => match.replace(/\./gu, ' '));
  }
}

module.exports = Atomic;
