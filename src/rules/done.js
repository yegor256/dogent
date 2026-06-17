/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Done.
 *
 * Demands that a SKILL.md state a verifiable completion check, symmetric
 * to the description trigger requirement. A standalone checker can only
 * approximate: it scans headings and prose for a verification signal. Its
 * prompt hands the deeper judgement to the AI oracle, which weighs whether
 * the stated check is truly pass/fail testable rather than vague.
 */
class Done {
  constructor() {
    this.id = 'done';
  }
  prompt() {
    return `${this.id}: in a SKILL.md, judge whether the stated completion check is actually pass/fail testable rather than a vague gesture toward being finished`;
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const signals = document.walk({
      header: (text) => [/\b(?:verify|done|check|validation|acceptance)\b/iu.test(text)],
      prose: (text) => [/\b(?:confirm|assert|verify|the test passes|tests pass|exit code|pass\/fail)\b/iu.test(text)],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
    if (signals.some((signal) => signal)) {
      return [];
    }
    return [
      new Violation(
        this.id,
        'warning',
        'SKILL.md never says how to verify completion',
        new Region(uri, 1, 1)
      )
    ];
  }
}

module.exports = Done;
