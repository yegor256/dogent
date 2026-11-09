/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * MetaReference.
 *
 * Flags self-referential framing of the model or the document, such as
 * "as an AI", "you are a model", "this prompt", or "these instructions".
 * Such framing narrates the setup instead of issuing a command, so it
 * adds no instruction and earns deletion. Distinct from persona, which
 * targets role assignment like "Act as a reviewer"; this one targets
 * the model talking about itself or the document talking about itself.
 */
class MetaReference {
  constructor() {
    this.id = 'meta-reference';
    this.phrase = /\b(?:as[ \t]+an[ \t]+ai|as[ \t]+a[ \t]+language[ \t]+model|you[ \t]+are[ \t]+an[ \t]+ai|you[ \t]+are[ \t]+a[ \t]+model|this[ \t]+prompt|these[ \t]+instructions|this[ \t]+manifesto|the[ \t]+system[ \t]+prompt)\b/giu;
  }
  hint() {
    return 'Delete self-referential framing such as as an AI or this prompt, since it narrates the setup instead of issuing a command.';
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
    const masked = mask(text);
    const out = [];
    let hit = this.phrase.exec(text);
    while (hit !== null) {
      if (masked.slice(hit.index, hit.index + hit[0].length) === hit[0]) {
        out.push(new Violation(
          this.id,
          'warning',
          `meta self-reference "${hit[0]}" issues no command, delete it`,
          new Region(uri, line, hit.index + 1)
        ));
      }
      hit = this.phrase.exec(text);
    }
    return out;
  }
}

module.exports = MetaReference;
