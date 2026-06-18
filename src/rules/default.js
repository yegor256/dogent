/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Default.
 *
 * Demands that optional behavior names its default. A line marking work
 * as optional through "optionally", "you may", or "feel free to" leaves
 * the agent guessing what happens when it declines, so the line must
 * state a default. A line that already declares one through "by
 * default", "defaults to", or "otherwise" passes untouched. Its prompt
 * hands subtler optionality with no stated default to the AI oracle.
 */
class Default {
  constructor() {
    this.id = 'default';
  }
  hint() {
    return 'State the default outcome whenever you mark behavior optional, telling the agent exactly what to do when it declines the option.';
  }
  prompt() {
    return `${this.id}: flag optionality that names no default even without a listed marker, and state the default`;
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
    if ((/\b(?:by default|default to|defaults to|otherwise)\b/iu).test(masked)) {
      return [];
    }
    const found = [];
    const regex = /\b(?:optionally|you may|you can|if you want|feel free to|as an option)\b/giu;
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `optional behavior "${hit[0]}" has no default, state it`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = Default;
