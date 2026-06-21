/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * NoArticles.
 *
 * Demands that instructions carry no articles, the cheapest kind of
 * noise. Flags every standalone "a", "an", and "the".
 *
 * The exhaustive regex catches every article on its own, so the check is
 * standalone and deterministic. prompt() returns an empty string and the
 * AI oracle never re-checks this rule, sparing it the spurious flags it
 * invented on prose lines that carry no article.
 */
class NoArticles {
  constructor() {
    this.id = 'no-articles';
  }
  hint() {
    return 'Remove filler articles such as a, an, and the, since they add noise without changing the instruction.';
  }
  prompt() {
    return '';
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
    const found = [];
    const masked = mask(text);
    const regex = /\b(?:a|an|the)\b/giu;
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'error',
        `article "${hit[0]}" must be removed`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = NoArticles;
