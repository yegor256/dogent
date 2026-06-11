/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const Violation = require('../violation');
const Region = require('../region');

/**
 * NoArticles.
 *
 * Demands that instructions carry no articles, the cheapest kind of
 * noise. Flags every standalone "a", "an", and "the".
 */
class NoArticles {
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.scan(text, line, uri),
      snippet: () => [],
      bullets: () => []
    });
  }
  scan(text, line, uri) {
    const found = [];
    const regex = /\b(a|an|the)\b/gi;
    let hit = regex.exec(text);
    while (hit !== null) {
      found.push(new Violation(
        'no-articles',
        'error',
        `article "${hit[0]}" must be removed`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(text);
    }
    return found;
  }
}

module.exports = NoArticles;
