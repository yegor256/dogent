/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Command.
 *
 * Demands that every instruction sound like a command. A standalone
 * checker can only guess: it flags lines that open with a pronoun or
 * end with a question mark, both signs of description, not order. Its
 * prompt hands the subtler imperative-mood judgement to the AI oracle.
 * A deterministic guard then drops any oracle flag on a line that
 * shows neither sign, so a base-form imperative is never flagged.
 */
class Command {
  constructor() {
    this.id = 'command';
  }
  hint() {
    return 'Rewrite the line as a direct imperative that opens with a base-form verb such as Write, Strip, or Keep, dropping any pronoun, question, or plain statement.';
  }
  prompt() {
    return `${this.id}: flag any line that reads as a description, a question, or a plain statement rather than a direct order; a line opening with a base-form imperative verb, such as "Write", "Strip", "Drop", or "Keep", is itself a direct order and must never be flagged`;
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
    if (!this.describes(text)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line must sound like a command',
      new Region(uri, line, 1)
    )];
  }
  suppress(violation, document) {
    if (violation.rule !== this.id) {
      return false;
    }
    const lines = document.text().split('\n');
    return !this.describes(lines[violation.spot.line() - 1] || '');
  }
  describes(text) {
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trim();
    if (clean === '') {
      return false;
    }
    const first = clean
      .split(/\s+/u)[0]
      .toLowerCase()
      .replace(/[^a-z]/gu, '');
    const weak = /^(?:i|you|we|they|he|she|it|this|that|these|those|there|here)$/u;
    return weak.test(first) || clean.slice(-1) === '?';
  }
}

module.exports = Command;
