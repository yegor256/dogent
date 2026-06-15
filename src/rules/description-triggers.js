/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * DescriptionTriggers.
 *
 * Demands that a SKILL.md description say when to use the skill. A
 * standalone checker can only approximate: it flags a value that is too
 * short or that never names a trigger with the word "when". Its prompt
 * hands the deeper judgement to the AI oracle, which weighs whether the
 * description truly names the situations and phrases that activate it.
 */
class DescriptionTriggers {
  constructor() {
    this.id = 'description-triggers';
    this.minimum = 20;
  }
  prompt() {
    return `${this.id}: in a SKILL.md, flag a description that is too short or fails to name the concrete situations and user phrases that should activate the skill, even when it contains the word "when"`;
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const pairs = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys) => keys
    });
    const found = pairs.filter((pair) => pair.key === 'description');
    if (found.length === 0) {
      return [];
    }
    return this.judge(found[0], uri);
  }
  judge(pair, uri) {
    const value = pair.value.trim();
    if (value.length < this.minimum) {
      return [this.flag('description too short', pair.row, uri)];
    }
    if (!/\bwhen\b/iu.test(value)) {
      return [this.flag('description must say when to use the skill', pair.row, uri)];
    }
    return [];
  }
  flag(message, row, uri) {
    return new Violation(this.id, 'warning', message, new Region(uri, row, 1));
  }
}

module.exports = DescriptionTriggers;
