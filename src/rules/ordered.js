/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Ordered.
 *
 * Demands a numbered list when order matters. Models follow numbered,
 * sequentially ordered steps far more reliably than unordered bullets,
 * and shuffling steps drops accuracy sharply. A standalone checker flags
 * an unordered bullet item that carries a sequence marker like "first",
 * "then", "next", "after that", "finally", or "step 2", since the order
 * is real but the structure hides it. Its prompt hands implicit ordering
 * with no marker word to the AI oracle.
 */
class Ordered {
  constructor() {
    this.id = 'ordered';
  }
  hint() {
    return 'Convert a sequence of steps into a numbered list, since models follow numbered ordered steps far more reliably than unordered bullets.';
  }
  prompt() {
    return `${this.id}: flag an implied sequence that no marker word signals, demanding a numbered list whenever the order of steps matters`;
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.scan(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, uri) {
    if (!/^\s*[-*+]\s+/u.test(text)) {
      return [];
    }
    const markers = /\b(?:first|second|third|then|next|after that|afterwards|finally|lastly|step\s+\d+)\b/iu;
    if (!markers.test(mask(text))) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'sequence detected, use a numbered list to fix the order',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Ordered;
