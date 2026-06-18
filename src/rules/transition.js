/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Transition.
 *
 * Flags a discourse connector that opens an instruction, like
 * "furthermore", "in summary", or "however". A leading connector
 * chains prose without adding a command, so it earns one violation.
 * The check stays disjoint from the polite rule: it lists no courtesy
 * word such as "please" or "make sure to". Its prompt hands looser
 * connective filler to the AI oracle for deletion.
 */
class Transition {
  constructor() {
    this.id = 'transition';
  }
  hint() {
    return 'Delete a discourse connector such as furthermore or however that opens a line, since it chains prose without adding a command.';
  }
  prompt() {
    return `${this.id}: flag connective filler beyond the fixed list, and delete it`;
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
    const [lead] = masked.match(/^\s*(?:[-*+]|\d+\.)?\s*/u);
    const rest = masked.slice(lead.length);
    const regex = /^(?:furthermore|moreover|additionally|in summary|in conclusion|in other words|as you can see|of course|basically|essentially|that said|however)\b/iu;
    const hit = regex.exec(rest);
    if (hit === null) {
      return [];
    }
    return [
      new Violation(
        this.id,
        'warning',
        `discourse transition "${hit[0]}" adds no instruction, delete it`,
        new Region(uri, line, lead.length + 1)
      )
    ];
  }
}

module.exports = Transition;
