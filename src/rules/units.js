/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Units.
 *
 * Demands that every magnitude carry a unit so the reader knows what
 * the number measures. A bare cardinal like "under 80" leaves the
 * scale implicit; "under 80 symbols" states it. The checker masks
 * inline code first, then scans each run of digits and flags one that
 * names no unit, skipping percentages, units already present, decimals
 * and versions, and leading list ordinals. Distinct from quantifier,
 * which targets vague amount words like "several"; here the number is
 * exact but its unit is missing.
 */
class Units {
  constructor() {
    this.id = 'units';
    this.unit = new RegExp(
      '^ ?(?:ms|s|sec|secs|second|seconds|min|mins|minute|minutes|' +
      'h|hr|hrs|hour|hours|d|day|days|week|weeks|month|months|' +
      'year|years|b|kb|mb|gb|tb|byte|bytes|bit|bits|char|chars|' +
      'character|characters|symbol|symbols|line|lines|word|words|' +
      'token|tokens|px|em|rem|pt|time|times|x)\\b',
      'u'
    );
  }
  prompt() {
    return `${this.id}: flag a magnitude whose unit is implicit even in context, and state what it measures`;
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
    const clean = mask(text);
    const found = [];
    const digits = /\d+/gu;
    let hit = digits.exec(clean);
    while (hit !== null) {
      if (!this.skip(clean, hit)) {
        found.push(new Violation(
          this.id,
          'warning',
          `number "${hit[0]}" has no unit, state what it measures`,
          new Region(uri, line, hit.index + 1)
        ));
      }
      hit = digits.exec(clean);
    }
    return found;
  }
  skip(clean, hit) {
    const after = clean.slice(hit.index + hit[0].length);
    if (after.startsWith('%') || this.unit.test(after)) {
      return true;
    }
    const before = clean.charAt(hit.index - 1);
    if (/[.v@\d]/u.test(before) || /^\.\d/u.test(after)) {
      return true;
    }
    const lead = /^\s*(?<num>\d+)\.\s/u.exec(clean);
    return lead !== null && lead.index + lead[0].indexOf(lead.groups.num) === hit.index;
  }
}

module.exports = Units;
