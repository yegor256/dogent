/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Terms.
 *
 * Flags synonym drift: one concept named several ways across a file.
 * Where consistent hunts word-for-word duplicates and contradictions,
 * this rule catches the same idea wearing different labels, which makes
 * the agent guess whether two names mean two things. A small built-in
 * map of synonym groups seeds the deterministic check; the broader,
 * fuzzier judgement is handed to the AI oracle through prompt().
 */
class Terms {
  constructor() {
    this.id = 'terms';
    this.groups = [
      ['agent', 'assistant', 'bot'],
      ['directory', 'folder'],
      ['parameter', 'argument', 'param', 'arg'],
      ['function', 'method', 'routine']
    ];
  }
  hint() {
    return 'Pick one canonical term for each concept and use it everywhere, since naming the same idea two ways makes the agent guess they differ.';
  }
  prompt() {
    return `${this.id}: flag any pair of words used interchangeably for one concept, and demand a single canonical term across the whole file`;
  }
  violations(document) {
    const uri = document.uri();
    const seen = this.groups.map(() => new Map());
    document.walk({
      header: () => [],
      prose: (text, line) => this.collect(text, line, seen),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
    return this.report(seen, uri);
  }
  collect(text, line, seen) {
    const masked = mask(text);
    this.groups.forEach((group, index) => {
      group.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'iu');
        if (regex.test(masked) && !seen[index].has(word)) {
          seen[index].set(word, line);
        }
      });
    });
    return [];
  }
  report(seen, uri) {
    const found = [];
    seen.forEach((members) => {
      if (members.size >= 2) {
        const names = Array.from(members.keys());
        const lines = Array.from(members.values());
        found.push(new Violation(
          this.id,
          'warning',
          `concept named two ways ("${names[0]}"/"${names[1]}"), pick one term`,
          new Region(uri, lines[1], 1)
        ));
      }
    });
    return found;
  }
}

module.exports = Terms;
