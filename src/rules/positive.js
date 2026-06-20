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
 * command. The prompt demands an actual negation before flagging, so
 * an affirmative imperative that already states what to do stays clean.
 * Because the model still misreads plain imperatives as bans, refine()
 * adds a deterministic guard: it drops any oracle flag on a line that
 * carries no negation token at all, so an affirmative imperative can
 * never be reported regardless of what the model returns.
 */
class Positive {
  constructor() {
    this.id = 'positive';
  }
  hint() {
    return 'Rewrite a prohibition as a positive imperative stating what to do, since a ban forces the model to process the forbidden idea first.';
  }
  prompt() {
    return `${this.id}: flag an instruction only when it forbids or negates an action, including a ban that carries no fixed keyword, and rewrite each as a positive imperative; leave an affirmative imperative that already states what to do untouched, returning nothing for it`;
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
  refine(violations, document) {
    const lines = document.text().split('\n');
    return violations.filter(
      (violation) => violation.rule !== this.id ||
        this.negated(lines[violation.spot.line() - 1] || '')
    );
  }
  negated(text) {
    const regex = /\b(?:do not|don't|never|avoid|refrain from|must not|no longer|no|not)\b/iu;
    return regex.test(mask(text));
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
