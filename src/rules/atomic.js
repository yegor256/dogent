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
 * subtler clause-counting to the AI oracle.
 *
 * @todo #21:45min Upgrade to a real clause-count check through an AI
 *  oracle so that subtle multi-instruction lines, which the conservative
 *  heuristic cannot see today, are reliably caught, as requested in
 *  issue #21.
 */
class Atomic {
  constructor() {
    this.id = 'atomic';
  }
  prompt() {
    return `${this.id}: flag any line that carries more than one instruction`;
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
    const welded = /;|\s(?:and|then)\s+[a-z]+\s+\S/u;
    if (!/[.!?]\s+\S/u.test(clean) && !welded.test(clean)) {
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
