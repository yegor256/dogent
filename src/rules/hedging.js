/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Hedging.
 *
 * Flags soft, non-committal, or hedging wording that weakens an order.
 * Catches words like "should", "just", "usually", and phrases like
 * "try to" or "if possible", each a sign of timid instruction.
 *
 * @todo #22:30min Upgrade to an AI oracle that catches subtler hedging,
 *  such as conditional escape hatches and vague scope, which the fixed
 *  blacklist of hedge words cannot detect today, as requested in
 *  issue #22.
 */
class Hedging {
  constructor() {
    this.id = 'hedging';
  }
  prompt() {
    return `${this.id}: flag soft, non-committal, or hedging wording`;
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
      '\\b(?:should|try to|if possible|as appropriate|as needed|' +
      'when necessary|usually|generally|etc|just|simply|very)\\b',
      'giu'
    );
    let hit = regex.exec(text);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `hedge word "${hit[0]}" must be removed`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(text);
    }
    return found;
  }
}

module.exports = Hedging;
