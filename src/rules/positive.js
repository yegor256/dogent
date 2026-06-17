/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Positive.
 *
 * Demands positive, goal-oriented imperatives over bans. A standalone
 * checker flags a line whose head is an obvious prohibition: "do not",
 * "don't", "never", "avoid", "refrain from", "must not", or "no longer".
 * A ban forces the model to process the forbidden concept first, so
 * "Only use real data" beats "Don't use mock data". Its prompt hands
 * subtler bans, those carrying no head keyword, to the AI
 * oracle, which rewrites a prohibition with no keyword as a positive
 * command.
 */
class Positive {
  constructor() {
    this.id = 'positive';
  }
  prompt() {
    return `${this.id}: flag any instruction phrased as a prohibition, including bans carrying no fixed keyword, and rewrite each as a positive imperative`;
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
    const regex = /^(?<marker>\s*(?:[-*+]|\d+\.)\s+)?(?:do not|don't|never|avoid|refrain from|must not|no longer)\b/iu;
    const hit = regex.exec(mask(text));
    if (hit === null) {
      return [];
    }
    const marker = hit.groups.marker || '';
    return [new Violation(
      this.id,
      'warning',
      'negative phrasing detected, state the positive command instead',
      new Region(uri, line, marker.length + 1)
    )];
  }
}

module.exports = Positive;
