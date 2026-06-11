/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const Violation = require('../violation');
const Region = require('../region');

/**
 * Grouped.
 *
 * Demands that every instruction live under a section. Any prose that
 * appears before the first heading is loose and therefore a violation.
 */
class Grouped {
  violations(document) {
    const uri = document.uri();
    const marks = document.walk({
      header: (text, line) => [{header: true, line}],
      prose: (text, line) => [{header: false, line}],
      snippet: () => [],
      bullets: () => []
    });
    let first = Infinity;
    marks.forEach((mark) => {
      if (mark.header && mark.line < first) {
        first = mark.line;
      }
    });
    return marks
      .filter((mark) => !mark.header && mark.line < first)
      .map((mark) => new Violation(
        'grouped',
        'error',
        'instruction not grouped under a section',
        new Region(uri, mark.line, 1)
      ));
  }
}

module.exports = Grouped;
