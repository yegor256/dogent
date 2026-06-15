/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Simple.
 *
 * Demands simple grammar over ambiguity. A standalone checker can only
 * guess: it counts commas and conjunctions to flag lines that pile up
 * clauses. Its prompt hands the subtler tangle judgement to the oracle,
 * which weighs true clause depth rather than counting punctuation.
 */
class Simple {
  constructor() {
    this.id = 'simple';
  }
  prompt() {
    return `${this.id}: flag any grammatically tangled, multi-clause instruction, judging true clause depth even when the line carries few commas or conjunctions`;
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.judge(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  judge(text, line, uri) {
    const commas = text.match(/,/gu);
    const commaCount = commas === null ? 0 : commas.length;
    const hasConjunction = /\b(?:if|when|unless|because|although|while)\b/iu.test(text);
    const tangled = hasConjunction && commaCount >= 2 || commaCount >= 3;
    if (!tangled) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line is grammatically tangled, split into simpler lines',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Simple;
