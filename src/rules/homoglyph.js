/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Homoglyph.
 *
 * Rejects mixed-script look-alike characters that masquerade as plain
 * ASCII. A token mixing an ASCII Latin letter with a confusable from
 * Cyrillic, Greek, or full-width Latin reads as one word yet hides a
 * foreign codepoint, so it slips past humans while breaking tools. The
 * check flags every such confusable character at its own column. Inline
 * code is masked first, so a deliberately quoted example stays clean.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class Homoglyph {
  constructor() {
    this.id = 'homoglyph';
    this.latin = /[A-Za-z]/u;
    this.confusable = /[Ѐ-ӿͰ-Ͽ＀-￯]/u;
  }
  hint() {
    return 'Replace the mixed-script look-alike character with its plain ASCII equivalent, since a foreign codepoint hidden inside a word breaks tooling.';
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: (text, line) => this.scan(text, line, uri),
      prose: (text, line) => this.scan(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, uri) {
    const clean = mask(text);
    const result = [];
    const token = /\S+/gu;
    let match = token.exec(clean);
    while (match !== null) {
      const [word] = match;
      if (this.latin.test(word) && this.confusable.test(word)) {
        this.flag(word, match.index).forEach((spot) => {
          result.push(new Violation(
            this.id,
            'error',
            `mixed-script character "${spot.char}" (U+${spot.point}) found, use plain ASCII`,
            new Region(uri, line, spot.column)
          ));
        });
      }
      match = token.exec(clean);
    }
    return result;
  }
  flag(word, start) {
    const spots = [];
    [...word].forEach((char, offset) => {
      if (!this.confusable.test(char)) {
        return;
      }
      const point = char
        .codePointAt(0)
        .toString(16)
        .toUpperCase()
        .padStart(4, '0');
      spots.push({char, point, column: start + offset + 1});
    });
    return spots;
  }
}

module.exports = Homoglyph;
