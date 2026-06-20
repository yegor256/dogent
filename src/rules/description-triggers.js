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
 * A quoted example phrase is the strongest form of that naming, so a
 * deterministic guard then vetoes any oracle flag on a description that
 * holds both "when" and a quoted phrase, however the model rules.
 */
class DescriptionTriggers {
  constructor() {
    this.id = 'description-triggers';
    this.minimum = 20;
  }
  hint() {
    return 'Name the concrete situations and user phrases that should activate the skill in its description, so the loader knows exactly when to invoke it.';
  }
  prompt() {
    return `${this.id}: in a SKILL.md, flag a description that is too short or fails to name the concrete situations and user phrases that should activate the skill, even when it contains the word "when"; a description that quotes an example user phrase, such as "file this bug", already names a trigger in its strongest form and must never be flagged`;
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
  suppress(violation, document) {
    if (violation.rule !== this.id) {
      return false;
    }
    const value = this.description(document);
    return /\bwhen\b/iu.test(value) && this.quoted(value);
  }
  description(document) {
    const pairs = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys) => keys
    });
    const found = pairs.filter((pair) => pair.key === 'description');
    if (found.length === 0) {
      return '';
    }
    return found[0].value.trim();
  }
  quoted(value) {
    return /["'‘’“”][^"'‘’“”]+["'‘’“”]/u.test(value);
  }
  flag(message, row, uri) {
    return new Violation(this.id, 'warning', message, new Region(uri, row, 1));
  }
}

module.exports = DescriptionTriggers;
