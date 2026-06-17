/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Placement.
 *
 * Transformers attend most to the start and the end of their input and
 * skim the middle, so a critical section buried in the middle third of a
 * manifesto sits exactly where the model is least likely to use it. This
 * standalone check spots a critical section by a heading keyword (Safety,
 * Security, Mission, Critical, Constraints) and warns when it lands in
 * the middle third rather than near the top or bottom. The generic word
 * "Rules" is left out on purpose: it names a neutral section in many
 * manifestos and would misfire. Its prompt hands the deeper judgement to
 * the AI oracle, which weighs which instruction matters most and whether
 * it is well placed.
 */
class Placement {
  constructor() {
    this.id = 'placement';
    this.keyword = /^#{1,6}\s+.*\b(?:safety|security|mission|critical|constraints?)\b/iu;
  }
  prompt() {
    return `${this.id}: identify the single most important instruction and judge whether it sits near the top or bottom of the file rather than buried in the middle`;
  }
  violations(document) {
    const uri = document.uri();
    const total = document.text().split('\n').length;
    return document.walk({
      header: (text, row) => this.check(text, row, total, uri),
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  check(text, row, total, uri) {
    if (!this.keyword.test(text)) {
      return [];
    }
    const ratio = row / total;
    if (ratio <= 1 / 3 || ratio >= 2 / 3) {
      return [];
    }
    const name = text.replace(/^#+\s*/u, '').trim();
    return [new Violation(
      this.id,
      'warning',
      `critical section "${name}" is buried, move it to the top or bottom`,
      new Region(uri, row, 1)
    )];
  }
}

module.exports = Placement;
