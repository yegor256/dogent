/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * SectionLevel.
 *
 * Demands that every section sit at the second level, marked by two
 * hashes. A lone top-level title may open the file, but any later
 * first-level heading or any deeper sub-heading breaks the flat shape
 * a manifesto must keep.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class SectionLevel {
  constructor() {
    this.id = 'section-level';
  }
  hint() {
    return 'Make every section a level-2 heading marked by two hashes, allowing only one optional top-level title to open the file.';
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    return document
      .walk({
        header: (text, line, depth) => [{line, depth}],
        prose: () => [],
        snippet: () => [],
        bullets: () => [],
        frontmatter: () => []
      })
      .map((header, index) => this.leveled(header, index, uri))
      .flat();
  }
  leveled(header, index, uri) {
    if (header.depth === 2 || header.depth === 1 && index === 0) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `section must be a level-2 heading, found ${header.depth}`,
      new Region(uri, header.line, 1)
    )];
  }
}

module.exports = SectionLevel;
