/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Stale.
 *
 * Flags volatile time and version references that rot over time:
 * words like "currently", "now", "today", "recently", and hardcoded
 * version literals such as "18.17.0". Each pins an instruction to a
 * moment or release that drifts, so the manifesto silently ages. The
 * rule scans only prose, never fenced snippets, so version pins inside
 * code blocks survive untouched.
 */
class Stale {
  constructor() {
    this.id = 'stale';
  }
  hint() {
    return 'Replace a volatile time or version reference such as currently or a pinned version number with a durable rule that never rots.';
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
    const regex = new RegExp(
      '\\b(?:currently|now|today|recently|lately|at present|as of|' +
      'the latest)\\b|\\bv?\\d+\\.\\d+(?:\\.\\d+)?\\b',
      'giu'
    );
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `volatile reference "${hit[0]}" will rot, state a durable rule`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = Stale;
