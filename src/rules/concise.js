/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Concise.
 *
 * Bounds a manifesto by structure, not only by token volume. Models read
 * the start and end of a long context and skip the middle, so a manifesto
 * that runs past a line budget silently buries its middle instructions.
 * Counts physical lines and warns once the file crosses a configurable
 * ceiling, recommending a split into referenced detail files in the
 * spirit of progressive disclosure. This is distinct from token-count: it
 * measures structure and position risk, not raw token volume.
 */
class Concise {
  constructor(max) {
    this.id = 'concise';
    this.max = max;
  }
  hint() {
    return 'Shorten the file or split its detail into referenced files so its middle instructions survive, since models attend to the start and end and skim the middle.';
  }
  violations(document) {
    const lines = document.text().split('\n');
    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    if (lines.length <= this.max) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      `file too long (${lines.length} lines), split detail into referenced files`,
      new Region(document.uri(), this.max + 1, 1)
    )];
  }
}

module.exports = Concise;
