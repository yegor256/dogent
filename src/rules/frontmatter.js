/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Frontmatter.
 *
 * Demands that a skill file open with a YAML frontmatter block, declare
 * every required key, and carry no key outside the allowed set. The
 * block is mandatory for the named file and ignored for every other.
 */
class Frontmatter {
  constructor(name, required, allowed) {
    this.id = 'frontmatter';
    this.name = name;
    this.required = required;
    this.allowed = allowed;
  }
  prompt() {
    return `${this.id}: in a ${this.name} file, flag any required key whose value is empty, vague, or a leftover placeholder`;
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== this.name) {
      return [];
    }
    const blocks = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (pairs) => [pairs]
    });
    if (blocks.length === 0) {
      return [new Violation(
        this.id,
        'error',
        'skill must open with frontmatter',
        new Region(uri, 1, 1)
      )];
    }
    return this.missing(blocks[0], uri).concat(this.extra(blocks[0], uri));
  }
  missing(pairs, uri) {
    const present = pairs.map((pair) => pair.key);
    return this.required
      .filter((key) => !present.includes(key))
      .map((key) => new Violation(
        this.id,
        'error',
        `frontmatter must declare "${key}"`,
        new Region(uri, 1, 1)
      ));
  }
  extra(pairs, uri) {
    return pairs
      .filter((pair) => !this.allowed.includes(pair.key))
      .map((pair) => new Violation(
        this.id,
        'error',
        `frontmatter key "${pair.key}" forbidden`,
        new Region(uri, pair.row, 1)
      ));
  }
}

module.exports = Frontmatter;
