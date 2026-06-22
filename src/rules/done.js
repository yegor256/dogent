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
 * to the description trigger requirement. It scans headings and prose
 * for a verification signal.
 */
class Done {
  constructor() {
    this.id = 'done';
  }
  hint() {
    return 'Add a verifiable, pass-or-fail completion check to the SKILL.md so the agent knows exactly how to confirm the work is finished.';
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
