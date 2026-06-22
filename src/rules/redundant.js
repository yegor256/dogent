/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

const PHRASES = [
  'be helpful',
  'be helpful and accurate',
  'be accurate',
  'be concise',
  'be clear',
  'be polite',
  'be professional',
  'write clean code',
  'write good code',
  'write readable code',
  'write maintainable code',
  'follow best practices',
  'follow industry best practices',
  'use best practices',
  'apply best practices',
  'use meaningful variable names',
  'use descriptive variable names',
  'use good variable names',
  'handle errors properly',
  'handle errors gracefully',
  'handle exceptions properly',
  'avoid bugs',
  'avoid mistakes',
  'think step by step',
  'do your best',
  'try your best',
  'pay attention to detail'
];

/**
 * Redundant.
 *
 * Flags a line that restates default model behavior, like
 * "Be helpful and accurate" or "Write clean code". Such filler
 * burns the context budget and drowns the project-specific
 * guidance the manifesto exists to carry. The curated blacklist
 * below names every phrase the rule rejects.
 */
class Redundant {
  constructor(phrases = PHRASES) {
    this.id = 'redundant';
    this.phrases = phrases;
  }
  hint() {
    return 'Delete the line that restates default model behavior, since generic advice the model already knows wastes the context budget.';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.judge(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  judge(text, line, uri) {
    const clean = text
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/u, '')
      .replace(/[.!?]+\s*$/u, '')
      .trim()
      .toLowerCase();
    if (!this.phrases.includes(clean)) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      'generic instruction, model already knows this',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Redundant;
