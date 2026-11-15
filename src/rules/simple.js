/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

const conj = 'if|when|unless|because|although|while';

/**
 * Counts the commas that sit inside a coordinated `A, B, or C` list run,
 * so an enumeration can be discounted before clause commas are weighed.
 * A chunk between two commas may only serve as a list item when it
 * carries no clause conjunction; a chunk like `unless retry is enabled`
 * is a clause of its own, and its comma stays counted.
 * @param {string} text The line to scan
 * @return {number} The number of commas belonging to coordinated lists
 */
const listCommas = function listCommas(text) {
  const pattern = new RegExp(
    `(?:(?![^,]*\\b(?:${conj})\\b)[^,]+,\\s*)+(?:or|and)\\b`,
    'giu'
  );
  const runs = text.match(pattern);
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
 * Demands simple grammar over ambiguity. It counts commas and
 * conjunctions to flag lines that pile up clauses. Inline-code spans
 * are blanked out first, so quoted tokens never read as sentence
 * grammar. Commas inside a coordinated `A, B, or C` list are
 * discounted next, so a lone enumeration sitting in one clause does
 * not read as tangled.
 */
class Simple {
  constructor() {
    this.id = 'simple';
    this.conjunction = new RegExp(`\\b(?:${conj})\\b`, 'iu');
  }
  hint() {
    return 'Split a tangled multi-clause sentence into several short, simple lines so the grammar leaves no room for ambiguity.';
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
  clauseCommas(text) {
    const commas = text.match(/,/gu);
    const count = commas === null ? 0 : commas.length;
    return count - listCommas(text);
  }
  judge(text, line, uri) {
    const masked = mask(text);
    const clauseCommas = this.clauseCommas(masked);
    const hasConjunction = this.conjunction.test(masked);
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
