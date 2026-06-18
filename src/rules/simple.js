/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Counts the commas that sit inside a coordinated `A, B, or C` list run,
 * so an enumeration can be discounted before clause commas are weighed.
 * @param {string} text The line to scan
 * @return {number} The number of commas belonging to coordinated lists
 */
const listCommas = function listCommas(text) {
  const runs = text.match(/(?:[^,]+,\s*)+(?:or|and)\b/giu);
  if (runs === null) {
    return 0;
  }
  return runs.reduce((sum, run) => {
    const inner = run.match(/,/gu);
    return sum + (inner === null ? 0 : inner.length);
  }, 0);
};

/**
 * Simple.
 *
 * Demands simple grammar over ambiguity. A standalone checker can only
 * guess: it counts commas and conjunctions to flag lines that pile up
 * clauses. Commas inside a coordinated `A, B, or C` list are discounted
 * first, so a lone enumeration sitting in one clause does not read as
 * tangled. Its prompt hands the subtler tangle judgement to the oracle,
 * which weighs true clause depth rather than counting punctuation.
 */
class Simple {
  constructor() {
    this.id = 'simple';
  }
  hint() {
    return 'Split a tangled multi-clause sentence into several short, simple lines so the grammar leaves no room for ambiguity.';
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
    const clauseCommas = commaCount - listCommas(text);
    const hasConjunction = /\b(?:if|when|unless|because|although|while)\b/iu.test(text);
    const tangled = hasConjunction && clauseCommas >= 2;
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
