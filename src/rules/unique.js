/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

const normalize = (text) => {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gu, '')
    .replace(/\b(?:a|an|the)\b/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
  return clean.split(' ').sort().join(' ');
};

/**
 * Unique.
 *
 * Flags any instruction that repeats another instruction in the file.
 * It normalizes each prose line, then remembers the first line where
 * each normal form appeared, so a later twin earns one violation.
 */
class Unique {
  constructor() {
    this.id = 'unique';
  }
  hint() {
    return 'Remove the repeated instruction and state each rule once, since duplicated guidance wastes context and can drift out of sync.';
  }
  violations(document) {
    const uri = document.uri();
    const lines = document.walk({
      header: () => [],
      prose: (text, line) => [{text, line}],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
    return this.repeats(uri, lines);
  }
  repeats(uri, lines) {
    const seen = new Map();
    const found = [];
    lines.forEach((item) => {
      const norm = normalize(item.text);
      if (norm === '') {
        return;
      }
      if (seen.has(norm)) {
        found.push(new Violation(
          this.id,
          'warning',
          `instruction repeats line ${seen.get(norm)}`,
          new Region(uri, item.line, 1)
        ));
      } else {
        seen.set(norm, item.line);
      }
    });
    return found;
  }
}

module.exports = Unique;
