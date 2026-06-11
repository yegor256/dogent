/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * ShortSections.
 *
 * Demands that every section name be a short label of one to three
 * words, so the manifesto reads as a map and not as prose.
 */
class ShortSections {
  constructor() {
    this.id = 'short-sections';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: (text, line) => this.named(text, line, uri),
      prose: () => [],
      snippet: () => [],
      bullets: () => []
    });
  }
  named(text, line, uri) {
    const words = text
      .replace(/^#{1,6}\s+/u, '')
      .trim()
      .split(/\s+/u)
      .filter((word) => word !== '');
    if (words.length >= 1 && words.length <= 3) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `section name must be 1-3 words, has ${words.length}`,
      new Region(uri, line, 1)
    )];
  }
}

module.exports = ShortSections;
