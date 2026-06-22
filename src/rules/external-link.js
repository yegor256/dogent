/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * ExternalLink.
 *
 * Flags a bare http(s):// URL sitting in prose or a bullet item, where
 * the page behind it may rot or inject hidden instructions. Durable
 * guidance belongs inlined, not fetched at run time. A URL inside
 * inline code or a fenced snippet is exempt, since those are examples.
 * Distinct from dead-import, which targets local @path imports; this
 * one complements untrusted and stale.
 */
class ExternalLink {
  constructor() {
    this.id = 'external-link';
  }
  hint() {
    return 'Inline the durable guidance instead of linking to an external URL, since the page may rot or smuggle hidden instructions at run time.';
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
    const regex = /(?:https?:\/\/)\S+/giu;
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        'external URL may rot or inject, encode durable guidance instead',
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = ExternalLink;
