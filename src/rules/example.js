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
 * "Example" section heading, and flags the one that has neither.
 */
class Example {
  constructor() {
    this.id = 'example';
  }
  hint() {
    return 'Add at least one concrete worked input and output example to the SKILL.md, since a single demonstration guides the agent far better than prose alone.';
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    if (this.hints(document).length > 0) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'SKILL.md has no example, add a worked input/output sample',
      new Region(uri, 1, 1)
    )];
  }
  hints(document) {
    return document.walk({
      header: (text) => this.heading(text),
      prose: () => [],
      snippet: () => ['snippet'],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  heading(text) {
    if (/^#{1,6}\s+examples?\b/iu.test(text)) {
      return [this.id];
    }
    return [];
  }
}

module.exports = Example;
