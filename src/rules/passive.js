/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Passive.
 *
 * Demands active imperative voice. Flags a "be" verb followed, perhaps
 * through an adverb, by a past participle, the surest mark of passive
 * voice.
 */
class Passive {
  constructor() {
    this.id = 'passive';
  }
  hint() {
    return 'Rewrite the line in active imperative voice, naming the action to take instead of describing what gets done.';
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
    const regex = /\b(?:is|are|was|were|be|been|being)\b\s+(?:\w+ly\s+)?(?:\w+ed|written|done|made|built|kept|sent|shown|seen|taken|given|held|found|run|read|set)\b(?=\s*$|\s*[.,;:!?)]|\s+(?:by|in|into|onto|to|from|with|within|without|for|on|at|as|through|against|over|under|after|before|during|upon|per|about)\b)/iu;
    if (!regex.test(text)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line uses passive voice',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Passive;
