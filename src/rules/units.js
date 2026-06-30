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
 * inline code and bare URLs first, then scans each run of digits and
 * flags one that names no unit, skipping percentages, units already
 * present (even past a masked span, as in "10 `file.txt` files"),
 * decimals and versions, leading list ordinals, a digit run welded to a
 * letter (part of an identifier like "yegor256"), a calendar year in
 * 1900-2099, an edition suffix glued to a letter after an apostrophe
 * ("ICCQ'26"), the lower bound of a range whose unit trails the upper
 * bound ("between 40 and 200 words"), and a status code whose preceding
 * word is "code", "status", or "HTTP" ("exit code 0"), which names an
 * identifier rather than a magnitude. Distinct from quantifier,
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
      'token|tokens|file|files|thought|thoughts|guest|guests|' +
      'repo|repos|issue|issues|method|methods|class|classes|' +
      'px|em|rem|pt|time|times|x)\\b',
      'u'
    );
  }
  hint() {
    return 'State the unit beside every magnitude, such as 80 symbols, so the reader knows what the number measures.';
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
    const clean = mask(text)
      .replace(/https?:\/\/\S+/giu, (url) => ' '.repeat(url.length));
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
    const after = clean.slice(hit.index + hit[0].length).replace(/^\s+/u, ' ');
    return after.startsWith('%') || this.unit.test(after) || this.range(after) ||
      /^(?:19|20)\d\d$/u.test(hit[0]) || this.welded(clean, hit, after) ||
      this.ordinal(clean, hit);
  }
  welded(clean, hit, after) {
    const before = clean.charAt(hit.index - 1);
    return /[.v@A-Za-z\d]/u.test(before) || /^\.\d/u.test(after) ||
      /\b(?:code|status|http)\s*$/iu.test(clean.slice(0, hit.index)) ||
      before === '\'' && /[A-Za-z]/u.test(clean.charAt(hit.index - 2));
  }
  ordinal(clean, hit) {
    const lead = /^\s*(?<num>\d+)\.\s/u.exec(clean);
    return lead !== null && lead.index + lead[0].indexOf(lead.groups.num) === hit.index;
  }
  range(after) {
    const tail = /^\s*(?:to|and|or|through|[-–—])\s*\d+/u.exec(after);
    return tail !== null && this.unit.test(after.slice(tail[0].length));
  }
}

module.exports = Units;
