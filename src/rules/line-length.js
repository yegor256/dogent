/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * LineLength.
 *
 * Demands that every instruction and every heading stay within a
 * maximum width. Code snippets are exempt, since code is not prose.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class LineLength {
  constructor(max) {
    this.id = 'line-length';
    this.max = max;
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: (text, line) => this.over(text, line, uri),
      prose: (text, line) => this.over(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  over(text, line, uri) {
    if (text.length <= this.max) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `line exceeds ${this.max} symbols, has ${text.length}`,
      new Region(uri, line, this.max + 1)
    )];
  }
}

module.exports = LineLength;
