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
 * its own command. An adverbial "otherwise" or "else" after a modal
 * ("would otherwise praise") heads no branch and is not counted.
 * Distinct from simple, which weighs clause depth, and from atomic,
 * which counts instructions; this one targets branching alone. A lone
 * guard keeps just one keyword and stays clean.
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
    const hits = this.keywords(clean);
    if (hits.length < 2) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'multi-branch conditional, split each case into its own command',
      new Region(uri, line, hits[1].index + 1)
    )];
  }
  keywords(clean) {
    const modal = /\b(?:would|could|should|might|will|can|may|must)\s+$/iu;
    return [...clean.matchAll(/\b(?:if|unless|when|else|otherwise)\b/giu)]
      .filter((hit) => !(/^(?:else|otherwise)$/iu.test(hit[0]) &&
        modal.test(clean.slice(0, hit.index))));
  }
}

module.exports = Conditional;
