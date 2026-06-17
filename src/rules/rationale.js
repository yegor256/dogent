/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Rationale.
 *
 * Demands orders, not explanations. A standalone checker flags a line
 * that opens with a justification marker such as "because", "the
 * reason", "this keeps", "this ensures", "this helps", "so that", or
 * "in order to", since such a line argues a point instead of issuing a
 * command. Justification belongs in commit messages and design docs, so
 * its prompt hands subtler explanation-only lines to the AI oracle.
 */
class Rationale {
  constructor() {
    this.id = 'rationale';
  }
  prompt() {
    return `${this.id}: flag any line that explains a reason, motivation, or benefit instead of issuing a direct order, even when it carries no fixed marker, and convert each into a command or delete it`;
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
    const clean = mask(text).replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '');
    const regex = /^(?:because|the reason|this keeps|this ensures|this helps|so that|in order to)\b/iu;
    if (!regex.test(clean)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'rationale carries no command, delete or convert to an order',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Rationale;
