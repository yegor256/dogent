/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

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
    const clean = text.replace(/^\s*([-*+]|\d+\.)\s+/, '').trim();
    const first = clean.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const weak = [
      'i', 'you', 'we', 'they', 'he', 'she', 'it',
      'this', 'that', 'these', 'those', 'there', 'here'
    ];
    if (clean === '' || (weak.indexOf(first) === -1 && clean.slice(-1) !== '?')) {
      return [];
    }
    return [new Violation(
      'command',
      'warning',
      'line must sound like a command',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Command;
