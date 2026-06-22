/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * SelfContained.
 *
 * Demands that every line stand on its own without leaning on its
 * neighbours. It flags a relative cross-reference phrase like "see
 * above", "as mentioned below", or "the previous step" that breaks the
 * moment the file is reordered or chunked. A line pointing somewhere
 * concrete through a markdown link stays clean. Distinct from
 * referential, which targets bare pronouns; this one targets positional
 * cross-references.
 */
class SelfContained {
  constructor() {
    this.id = 'self-contained';
    this.phrase = new RegExp(
      'mentioned above|mentioned below|see above|see below|' +
      'as discussed|the section above|the section below|' +
      'the previous step|as stated earlier|mentioned earlier|' +
      'refer to the guide',
      'iu'
    );
  }
  hint() {
    return 'Replace a relative cross-reference such as see above with a concrete named target, so the line survives reordering and chunking.';
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
    const clean = mask(text);
    if (clean.includes('](')) {
      return [];
    }
    const hit = this.phrase.exec(clean);
    if (hit === null) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      `relative reference "${hit[0]}" breaks when reordered, name the target`,
      new Region(uri, line, hit.index + 1)
    )];
  }
}

module.exports = SelfContained;
