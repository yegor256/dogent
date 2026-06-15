/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Polite.
 *
 * Flags courtesy and scaffolding phrases that soften an instruction
 * without adding meaning: "please", "kindly", "feel free to", and the
 * like. Each phrase wastes tokens and weakens a command, so every hit
 * earns its own violation.
 *
 * The check is standalone and deterministic, so prompt() returns an
 * empty string and the AI oracle never re-checks this rule.
 */
class Polite {
  constructor() {
    this.id = 'polite';
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
    const masked = this.mask(text);
    const regex = /\b(?:please|kindly|feel free to|make sure to|be sure to|don't forget to|remember to|note that|it is important to)\b/giu;
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'error',
        `courtesy phrase "${hit[0]}" must be removed`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
  mask(text) {
    return text.replace(/`[^`]*`/gu, (span) => ' '.repeat(span.length));
  }
}

module.exports = Polite;
