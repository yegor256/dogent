/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Example.
 *
 * Demands that a SKILL.md demonstrate, not only describe. A skill that
 * states rules in prose alone leaves the agent to infer the exact shape
 * of correct output, while a single worked example is one of the most
 * reliable levers in prompt engineering. A standalone checker passes the
 * skill that carries at least one fenced code block or an explicit
 * "Example" section heading, and flags the one that has neither. Its
 * prompt hands the deeper judgement to the AI oracle, which weighs
 * whether a present code block is truly illustrative.
 */
class Example {
  constructor() {
    this.id = 'example';
  }
  prompt() {
    return `${this.id}: in a SKILL.md, judge whether a present code block is a genuine worked example rather than a stray snippet, and flag a skill that only describes without demonstrating`;
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const hints = document.walk({
      header: (text) => this.heading(text),
      prose: () => [],
      snippet: () => ['snippet'],
      bullets: () => [],
      frontmatter: () => []
    });
    if (hints.length > 0) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'SKILL.md has no example, add a worked input/output sample',
      new Region(uri, 1, 1)
    )];
  }
  heading(text) {
    if (/^#{1,6}\s+examples?\b/iu.test(text)) {
      return [this.id];
    }
    return [];
  }
}

module.exports = Example;
