/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Punctuation.
 *
 * Demands that every instruction read as one whole sentence: opening
 * with a capital letter and closing with a period. Headings, snippets,
 * and frontmatter escape this rule.
 */
class Punctuation {
  constructor() {
    this.id = 'punctuation';
  }
  prompt() {
    return `${this.id}: flag any instruction that is not one complete, grammatical sentence`;
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
    const [lead] = text.match(/^\s*(?:[-*+]|\d+\.)\s+/u) || text.match(/^\s*/u);
    const sentence = text.slice(lead.length).replace(/\s+$/u, '');
    const letter = sentence.match(/[A-Za-z]/u);
    return [].concat(
      sentence !== '' && letter !== null && letter[0] !== letter[0].toUpperCase()
        ? [new Violation(
          this.id,
          'error',
          'sentence must start with a capital letter',
          new Region(uri, line, lead.length + letter.index + 1)
        )]
        : [],
      sentence !== '' && sentence.slice(-1) !== '.'
        ? [new Violation(
          this.id,
          'error',
          'sentence must end with a period',
          new Region(uri, line, lead.length + sentence.length)
        )]
        : []
    );
  }
}

module.exports = Punctuation;
