/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * TokenCount.
 *
 * Demands that a whole manifesto stay small enough to ride cheaply inside
 * an agent context. Counts every word, number, and punctuation symbol
 * across all fragments, frontmatter included, and complains once the sum
 * reaches a cap.
 */
class TokenCount {
  constructor(cap) {
    this.id = 'token-count';
    this.cap = cap;
  }
  hint() {
    return 'Cut bloated wording across the file so its total token count fits the cap, keeping every instruction terse.';
  }
  prompt() {
    return `${this.id}: flag bloated wording that wastes the context budget`;
  }
  violations(document) {
    const count = (document.walk({
      header: (text) => [text],
      prose: (text) => [text],
      snippet: (text) => [text],
      bullets: () => [],
      frontmatter: (pairs) => pairs.map((pair) => `${pair.key} ${pair.value}`)
    }).join(' ').match(/[A-Za-z0-9]+|[^\sA-Za-z0-9]/gu) || []).length;
    if (count < this.cap) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `file exceeds ${this.cap} tokens, has ${count}`,
      new Region(document.uri(), 1, 1)
    )];
  }
}

module.exports = TokenCount;
