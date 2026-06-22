/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * HiddenChar.
 *
 * Demands that every line carry only visible characters, rejecting any
 * invisible or control codepoint that hides inside the text. Scans every
 * fragment, including snippets, because a zero-width space, a bidirectional
 * override, or a variation selector tucked into code is just as dangerous as
 * one tucked into prose. Flags zero-width characters, bidi controls, and
 * variation selectors, naming each by its hex codepoint so it can be deleted.
 */
class HiddenChar {
  constructor() {
    this.id = 'hidden-char';
    this.hidden = /[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;
  }
  hint() {
    return 'Delete the invisible or control character named by its codepoint, since hidden characters can corrupt parsing or smuggle instructions.';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: (text, line) => this.scan(text, line, uri),
      prose: (text, line) => this.scan(text, line, uri),
      snippet: (text, line) => this.scan(text, line, uri),
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, uri) {
    const found = [];
    this.hidden.lastIndex = 0;
    let hit = this.hidden.exec(text);
    while (hit !== null) {
      const hex = hit[0].codePointAt(0).toString(16).toUpperCase();
      const code = hex.padStart(4, '0');
      found.push(new Violation(
        this.id,
        'error',
        `invisible character U+${code} found, delete it`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = this.hidden.exec(text);
    }
    return found;
  }
}

module.exports = HiddenChar;
