/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Emoji.
 *
 * Flags any emoji or decorative pictographic symbol that adds token
 * noise without instruction. Inline code is masked first, so a fenced
 * or inline example may keep a needed glyph. Distinct from homoglyph,
 * which targets letters borrowed from other scripts; this one stays to
 * pictographs, symbols, and dingbats only and never flags a foreign
 * letter.
 */
class Emoji {
  constructor() {
    this.id = 'emoji';
    this.glyph = /[\p{Extended_Pictographic}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
  }
  hint() {
    return 'Delete decorative emoji and pictographic symbols, since they add token noise without carrying any instruction, and keep the text plain.';
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
    const masked = mask(text);
    const result = [];
    let hit = this.glyph.exec(masked);
    while (hit !== null) {
      result.push(new Violation(
        this.id,
        'warning',
        `decorative character "${hit[0]}" adds token noise, use plain text`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = this.glyph.exec(masked);
    }
    return result;
  }
}

module.exports = Emoji;
