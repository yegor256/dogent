/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * PseudoHeading.
 *
 * Rejects a bold line posing as a section heading, such as
 * "**Setup:**" standing alone. The whole line, once an optional list
 * marker drops, must sit inside one emphasis run, wrapped by "**" or
 * "__" and ending in an optional colon. A line carrying only inline
 * bold inside other words, like "Use **bold** sparingly.", stays free,
 * since the emphasis wraps a fragment, not the whole label.
 *
 * Its prompt hands borderline label-versus-instruction calls to the AI
 * oracle.
 */
class PseudoHeading {
  constructor() {
    this.id = 'pseudo-heading';
  }
  prompt() {
    return `${this.id}: flag any bold line posing as a section heading, deferring borderline label-versus-instruction calls to the oracle, and demand a real level-2 "##" heading`;
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
    const body = text.trim().replace(/^(?:[-*+]|\d+\.)\s+/u, '');
    if (!/^(?<fence>\*\*|__)(?!\s)(?:.+?)(?<!\s)\k<fence>:?$/u.test(body)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'bold pseudo-heading found, use a level-2 "##" heading',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = PseudoHeading;
