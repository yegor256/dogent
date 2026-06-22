/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Unfinished.
 *
 * Flags any prose line that still carries a leftover marker, the
 * fingerprint of work left half done. It catches the uppercase tokens
 * TODO, TBD, FIXME, XXX, and WIP, the placeholder phrase "lorem ipsum",
 * a trailing bare ellipsis, and an unfilled angle-bracket placeholder
 * such as <placeholder>.
 */
class Unfinished {
  constructor() {
    this.id = 'unfinished';
  }
  hint() {
    return 'Resolve every leftover marker such as TODO, a placeholder, or a trailing ellipsis, since they signal half-finished work.';
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
    const markers = [
      /\b(?:TODO|TBD|FIXME|XXX|WIP)\b/u,
      /lorem ipsum/iu,
      /\.\.\.\s*$/u,
      /<[^>\n]*>/u
    ];
    const masked = mask(text);
    if (!markers.some((marker) => marker.test(masked))) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      'leftover marker found, file looks unfinished',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Unfinished;
