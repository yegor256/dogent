/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * DescriptionLength.
 *
 * Demands that a SKILL.md description stay within a sane size. The
 * loader keeps every description in context, so an overgrown one wastes
 * the budget that the instructions need. Flags a value longer than the
 * ceiling and a value that is empty, leaving the wording itself to
 * sibling rules.
 */
class DescriptionLength {
  constructor() {
    this.id = 'description-length';
    this.ceiling = 1024;
  }
  hint() {
    return 'Write a SKILL.md description that is neither empty nor bloated, stating the capability concisely so it fits the loader budget.';
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const pairs = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys) => keys
    });
    const found = pairs.filter((pair) => pair.key === 'description');
    if (found.length === 0) {
      return [];
    }
    return this.judge(found[0], uri);
  }
  judge(pair, uri) {
    const {value} = pair;
    if (value.trim() === '') {
      return [this.flag('description is empty, write a concise capability statement', pair.row, uri)];
    }
    if (value.length > this.ceiling) {
      return [this.flag(`description is ${value.length} chars, keep it under ${this.ceiling}`, pair.row, uri)];
    }
    return [];
  }
  flag(message, row, uri) {
    return new Violation(this.id, 'warning', message, new Region(uri, row, 1));
  }
}

module.exports = DescriptionLength;
