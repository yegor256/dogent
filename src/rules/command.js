/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Command.
 *
 * Demands that every instruction sound like a command. A standalone
 * checker can only guess: it flags lines that open with a pronoun or
 * end with a question mark, both signs of description, not order.
 *
 * @todo #1 Replace this heuristic with a real imperative-mood check
 *  driven by an AI oracle when a token is present in the environment.
 */
class Command {
  constructor() {
    this.id = 'command';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.judge(text, line, uri),
      snippet: () => [],
      bullets: () => []
    });
  }
  judge(text, line, uri) {
    const clean = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '').trim();
    if (clean === '') {
      return [];
    }
    const first = clean
      .split(/\s+/u)[0]
      .toLowerCase()
      .replace(/[^a-z]/gu, '');
    const weak = /^(?:i|you|we|they|he|she|it|this|that|these|those|there|here)$/u;
    if (!weak.test(first) && clean.slice(-1) !== '?') {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'line must sound like a command',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Command;
