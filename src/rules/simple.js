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
 * which weighs true clause depth rather than counting punctuation. A
 * deterministic guard then drops any oracle flag on a line that carries
 * neither a comma nor a subordinating conjunction, since such a line
 * holds a single clause and cannot be tangled. The same guard drops any
 * oracle flag landing inside the YAML frontmatter, whose description is a
 * third-person capability statement the deterministic side never inspects.
 */
class Simple {
  constructor() {
    this.id = 'simple';
    this.conjunction = /\b(?:if|when|unless|because|although|while)\b/iu;
  }
  hint() {
    return 'Split a tangled multi-clause sentence into several short, simple lines so the grammar leaves no room for ambiguity.';
  }
  prompt() {
    return `${this.id}: flag any grammatically tangled, multi-clause instruction, judging true clause depth even when the line carries few commas or conjunctions, yet never count a single leading imperative trailed only by a coordinated object or Oxford-comma list as tangled even when a list item embeds its own verb, as in "Cover bug, why it is wrong, and proposed fix", which is one simple order "cover" taking a three-part object, not a tangled multi-clause sentence; never flag a line inside the YAML frontmatter, whose description is a third-person capability statement that names several actions in one sentence`;
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
  suppress(violation, document) {
    if (violation.rule !== this.id) {
      return false;
    }
    const line = violation.spot.line();
    if (line <= this.frontmatter(document)) {
      return true;
    }
    const lines = document.text().split('\n');
    return !this.tangleable(lines[line - 1] || '');
  }
  frontmatter(document) {
    return document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys, row, last) => [last]
    })[0] || 0;
  }
  tangleable(text) {
    return text.includes(',') || this.conjunction.test(text);
  }
  judge(text, line, uri) {
    const commas = text.match(/,/gu);
    const commaCount = commas === null ? 0 : commas.length;
    const clauseCommas = commaCount - listCommas(text);
    const hasConjunction = this.conjunction.test(text);
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
