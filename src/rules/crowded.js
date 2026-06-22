/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Crowded.
 *
 * Demands that every section stay small, holding no more instructions
 * than the limit allows. A section runs from one heading to the next
 * heading or to end-of-file; its instructions are the prose lines that
 * sit between them. Prose before the first heading is loose and belongs
 * to the grouped rule, so this rule ignores it.
 */
class Crowded {
  constructor(limit) {
    this.id = 'crowded';
    this.limit = limit;
  }
  hint() {
    return 'Split an overcrowded section into smaller sections, each holding only a handful of related instructions under its own short heading.';
  }
  violations(document) {
    const uri = document.uri();
    const marks = document.walk({
      header: (text, line) => [{header: true, line}],
      prose: (text, line) => [{header: false, line}],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
    const result = [];
    let open = null;
    let count = 0;
    marks.forEach((mark) => {
      if (mark.header) {
        this.flush(open, count, uri, result);
        open = mark;
        count = 0;
      } else if (open) {
        count += 1;
      }
    });
    this.flush(open, count, uri, result);
    return result;
  }
  flush(open, count, uri, result) {
    if (open && count > this.limit) {
      result.push(new Violation(
        this.id,
        'error',
        `section holds ${count} instructions, limit ${this.limit}`,
        new Region(uri, open.line, 1)
      ));
    }
  }
}

module.exports = Crowded;
