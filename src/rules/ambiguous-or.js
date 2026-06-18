/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * AmbiguousOr.
 *
 * An "either-or" choice left to the reader is an instruction the agent
 * cannot follow without guessing. This flags the literal "and/or" and a
 * two-term slashed alternative like "tabs/spaces", each demanding the
 * author pick one branch and state exactly which option applies. Inline
 * code is masked first, so a backticked path such as `src/app` never
 * matches. Subtler ambiguities stay with the oracle; prompt() defers
 * the open-ended either-or judgement to it.
 */
class AmbiguousOr {
  constructor() {
    this.id = 'ambiguous-or';
  }
  hint() {
    return 'Replace every either-or choice such as and/or or a slashed alternative with one explicit branch, naming exactly which option the agent must take so no guessing remains.';
  }
  prompt() {
    return `${this.id}: flag either-or ambiguity beyond "and/or" and slashed alternatives, and state exactly which option applies`;
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
    const masked = mask(text);
    const pattern = /\band\/or\b|(?<![\w./])[A-Za-z]{2,}\/[A-Za-z]{2,}(?![\w/]|\.\w)/giu;
    const found = [];
    let hit = pattern.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `ambiguous "${hit[0]}", state exactly which option applies`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = pattern.exec(masked);
    }
    return found;
  }
}

module.exports = AmbiguousOr;
