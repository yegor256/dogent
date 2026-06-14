/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Empty.
 *
 * Flags any heading that declares a section but carries no body.
 * A heading is empty when it is immediately followed by another
 * heading or by end-of-file — no prose, bullets, or snippet sits
 * between them.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class Empty {
  constructor() {
    this.id = 'empty';
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    const marks = document.walk({
      header: (text, line) => [{header: true, line}],
      prose: (text, line) => [{header: false, line}],
      bullets: (row) => [{header: false, line: row}],
      snippet: (text, line) => [{header: false, line}],
      frontmatter: () => []
    });
    const result = [];
    marks.forEach((mark, index) => {
      if (!mark.header) {
        return;
      }
      const next = marks[index + 1];
      if (!next || next.header) {
        result.push(new Violation(
          this.id,
          'error',
          'hollow section, no instructions found',
          new Region(uri, mark.line, 1)
        ));
      }
    });
    return result;
  }
}

module.exports = Empty;
