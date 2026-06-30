/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');
const quoted = require('../quoted');

/**
 * Vague.
 *
 * Flags subjective, unmeasurable qualifiers that pretend to be precise:
 * "properly", "good", "clean", "fast", "robust", and the like. Each
 * leaves the agent to guess a criterion that varies run to run, so a
 * vague qualifier is a non-instruction in disguise. A qualifier quoted
 * inside a described position — "argue that many small repositories
 * win" — names the subject matter, not the agent's deliverable, so it
 * passes. The list is kept apart from the hedging words so the two rules
 * never double-report.
 */
class Vague {
  constructor() {
    this.id = 'vague';
  }
  hint() {
    return 'Replace a subjective qualifier such as properly or clean with a concrete, checkable threshold the agent can measure.';
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
      '\\b(?:properly|correctly|appropriately|good|clean|fast|slow|' +
      'large|small|robust|reasonable|efficient|as much as possible|' +
      'if needed)\\b',
      'giu'
    );
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      if (!quoted(masked, hit.index)) {
        found.push(new Violation(
          this.id,
          'warning',
          `vague qualifier "${hit[0]}" carries no measurable criterion`,
          new Region(uri, line, hit.index + 1)
        ));
      }
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = Vague;
