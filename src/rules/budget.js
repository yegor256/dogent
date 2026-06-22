/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Budget.
 *
 * Demands that a whole manifesto stay short enough to stay readable,
 * holding no more instructions than the cap allows. Counts every prose
 * line plus every bullet item across the file and complains once with a
 * single file-level violation when the total exceeds the cap.
 */
class Budget {
  constructor(cap) {
    this.id = 'budget';
    this.cap = cap;
  }
  hint() {
    return 'Trim or split the manifesto so it holds fewer instructions than the budget, moving secondary guidance into separate referenced files to keep the core small.';
  }
  violations(document) {
    const count = document.walk({
      header: () => [],
      prose: () => [1],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    }).length;
    if (count <= this.cap) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `file holds ${count} instructions, budget ${this.cap}, split the manifesto`,
      new Region(document.uri(), 1, 1)
    )];
  }
}

module.exports = Budget;
