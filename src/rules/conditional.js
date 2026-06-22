/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Conditional.
 *
 * Demands that branching never collapse onto one line. A line carrying
 * more than one condition keyword (if, unless, when, else, otherwise)
 * spells out a whole branch tree at once, so each case must split into
 * its own command. Distinct from simple, which weighs clause depth, and
 * from atomic, which counts instructions; this one targets branching
 * alone. A lone guard keeps just one keyword and stays clean.
 */
class Conditional {
  constructor() {
    this.id = 'conditional';
  }
  hint() {
    return 'Break a line that packs several conditions into one case per line, so the agent never has to untangle a whole decision tree welded onto a single line.';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.judge(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  judge(text, line, uri) {
    const clean = mask(text);
    const hits = clean.match(/\b(?:if|unless|when|else|otherwise)\b/giu);
    if (hits === null || hits.length < 2) {
      return [];
    }
    const column = clean.search(/\b(?:if|unless|when|else|otherwise)\b/iu);
    return [new Violation(
      this.id,
      'warning',
      'multi-branch conditional, split each case into its own command',
      new Region(uri, line, column + 1)
    )];
  }
}

module.exports = Conditional;
