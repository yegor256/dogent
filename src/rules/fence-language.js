/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * FenceLanguage.
 *
 * Demands that every fenced code block declare a language right after
 * its opening fence. A bare fence of backticks or tildes with no info
 * string leaves readers and tooling guessing at the snippet's syntax,
 * so it earns a warning. A fence that names a language stays clean.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class FenceLanguage {
  constructor() {
    this.id = 'fence-language';
    this.fence = /^\s*(?:```|~~~)\s*(?<lang>\S*)/u;
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: () => [],
      snippet: (content, row) => this.scan(content, row, uri),
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(content, row, uri) {
    const [first] = content.split('\n');
    const hit = this.fence.exec(first);
    if (hit !== null && hit.groups.lang !== '') {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'fenced block has no language tag, declare one',
      new Region(uri, row, 1)
    )];
  }
}

module.exports = FenceLanguage;
