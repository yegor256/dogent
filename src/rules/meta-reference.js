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
    this.phrase = /\b(?:as an ai|as a language model|you are an ai|you are a model|this prompt|these instructions|this manifesto|the system prompt)\b/giu;
  }
  prompt() {
    return `${this.id}: flag self-referential framing of the model or document beyond the fixed list, and delete it`;
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
    let hit = this.phrase.exec(masked);
    while (hit !== null) {
      out.push(new Violation(
        this.id,
        'warning',
        `meta self-reference "${hit[0]}" issues no command, delete it`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = this.phrase.exec(masked);
    }
    return out;
  }
}

module.exports = MetaReference;
