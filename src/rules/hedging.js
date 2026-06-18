/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Hedging.
 *
 * Flags soft, non-committal, or hedging wording that weakens an order.
 * Catches words like "should", "just", "usually", and phrases like
 * "try to" or "if possible", each a sign of timid instruction. Its
 * prompt hands subtler hedging to the AI oracle, which catches the
 * conditional escape hatches and vague scope no fixed list can.
 */
class Hedging {
  constructor() {
    this.id = 'hedging';
  }
  hint() {
    return 'Remove hedging words such as should, just, or usually and state the order firmly, since timid wording weakens the command.';
  }
  prompt() {
    return `${this.id}: flag soft, non-committal, or hedging wording, including conditional escape hatches and vague scope that carry no fixed hedge word`;
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
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `hedge word "${hit[0]}" must be removed`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = Hedging;
