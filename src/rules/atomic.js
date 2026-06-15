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
 * checker only spots the loud signs: a sentence terminator sitting
 * mid-line with more text after it, or two verb phrases welded together
 * with a semicolon, an " and ", or a " then ". The prompt hands the
 * subtler clause-counting to the AI oracle, which catches the
 * multi-instruction lines that carry no such welding token.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  prompt() {
    return `${this.id}: flag any line that carries more than one instruction, counting distinct clauses even when no semicolon, "and", or "then" welds them together`;
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
    const weld = /(?<!,)\s(?:and|then)\s+(?<verb>[a-z]+)\s+\S/u.exec(clean);
    const welded = weld !== null &&
      !/^(?:the|a|an)$/u.test(weld.groups.verb) &&
      !/(?:ly|al|ial|ous|ive|less|ic|ary|ory|able|ible|ate)$/u.test(weld.groups.verb);
    if (!/[.!?]\s+\S/u.test(clean) && !/;/u.test(clean) && !welded) {
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
