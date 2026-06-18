/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Quantifier.
 *
 * Flags vague quantity words that leave the count to the agent: "some",
 * "several", "a few", "many", "multiple", and the like. Models track
 * exact quantifiers well yet diverge from human intent on vague ones,
 * whose meaning is an underspecified distribution rather than a number,
 * so a command manifesto should state the exact count or threshold. The
 * list is kept apart from the vague qualifiers so the two rules never
 * double-report. Its prompt hands implicit vagueness, where no listed
 * word appears, to the AI oracle.
 */
class Quantifier {
  constructor() {
    this.id = 'quantifier';
  }
  hint() {
    return 'Replace a vague quantity word such as some or several with an exact number or threshold the agent can act on.';
  }
  prompt() {
    return `${this.id}: flag a vague amount that names no exact count even without a listed word, and propose a concrete number or threshold to replace it`;
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.scan(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, uri) {
    const found = [];
    const regex = new RegExp(
      '\\b(?:some|several|a few|a couple|many|multiple|various|' +
      'numerous|a lot of|plenty of)\\b',
      'giu'
    );
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `vague quantity "${hit[0]}", state an exact number or threshold`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = Quantifier;
