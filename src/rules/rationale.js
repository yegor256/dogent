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
 * Demands orders, not explanations. The checker flags a line
 * that opens with a justification marker such as "because", "the
 * reason", "this keeps", "this ensures", "this helps", "so that", or
 * "in order to", since such a line argues a point instead of issuing a
 * command. Justification belongs in commit messages and design docs.
 */
class Rationale {
  constructor() {
    this.id = 'rationale';
  }
  hint() {
    return 'Delete the explanation or convert it into a direct order, since a manifesto carries commands, not justifications.';
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
