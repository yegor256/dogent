/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Polite.
 *
 * Flags courtesy and scaffolding phrases that soften an instruction
 * without adding meaning: "please", "kindly", "feel free to", and the
 * like. Each phrase wastes tokens and weakens a command, so every hit
 * earns its own violation.
 */
class Polite {
  constructor() {
    this.id = 'polite';
  }
  hint() {
    return 'Remove courtesy and scaffolding phrases such as please or make sure to, since they waste tokens and weaken the command.';
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
}

module.exports = Polite;
