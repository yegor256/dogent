/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Emphasis.
 *
 * Flags shouting that tries to force compliance through volume rather
 * than clarity: a curated all-caps word like "IMPORTANT" or "NEVER", a
 * run of two or more consecutive all-caps words, and repeated marks like
 * "!!" or "!?". The model gains nothing from volume, so the emphasis is
 * pure noise. A lone short acronym such as "JSON" or "AI" is left alone.
 * Its prompt hands the borderline emphasis and reward framing the
 * patterns miss to the AI oracle.
 */
class Emphasis {
  constructor() {
    this.id = 'emphasis';
    this.shout = new Set(['IMPORTANT', 'ALWAYS', 'NEVER', 'MUST', 'CRITICAL', 'REQUIRED']);
  }
  prompt() {
    return `${this.id}: flag emphatic shouting the patterns miss, including borderline all-caps and reward framing, since emphasis adds no instruction`;
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
    return this.punctuation(masked, line, uri).concat(this.shouting(masked, line, uri));
  }
  punctuation(masked, line, uri) {
    const found = [];
    const regex = /!{2,}|!\?|\?!/gu;
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(this.flag(hit[0], line, hit.index, uri));
      hit = regex.exec(masked);
    }
    return found;
  }
  shouting(masked, line, uri) {
    const found = [];
    const regex = /[A-Z]{2,}(?:\s+[A-Z]{2,})*/gu;
    let hit = regex.exec(masked);
    while (hit !== null) {
      const tokens = hit[0].split(/\s+/u);
      const loud = tokens.length > 1
        ? tokens.some((token) => token.length >= 5 || this.shout.has(token))
        : this.shout.has(tokens[0]);
      if (loud) {
        found.push(this.flag(hit[0], line, hit.index, uri));
      }
      hit = regex.exec(masked);
    }
    return found;
  }
  flag(marker, line, index, uri) {
    return new Violation(
      this.id,
      'warning',
      `emphasis marker "${marker}" adds no instruction, state it plainly`,
      new Region(uri, line, index + 1)
    );
  }
}

module.exports = Emphasis;
