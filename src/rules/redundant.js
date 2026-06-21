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
 * guidance the manifesto exists to carry. Following the hybrid
 * pattern of `command.js`, the curated blacklist below stays the
 * deterministic default and the prompt hands paraphrases beyond
 * that list to the AI oracle. A deterministic guard then drops any
 * oracle flag landing inside the YAML frontmatter, whose description is a
 * third-person capability statement the deterministic side never inspects.
 */
class Redundant {
  constructor(phrases = PHRASES) {
    this.id = 'redundant';
    this.phrases = phrases;
  }
  hint() {
    return 'Delete the line that restates default model behavior, since generic advice the model already knows wastes the context budget.';
  }
  prompt() {
    return `${this.id}: flag any line that restates default agent behavior already known to the model, not a project-specific instruction, including reworded paraphrases that match no fixed phrase list, yet never flag a line inside the YAML frontmatter, whose description is a third-person capability statement that names several actions in one sentence`;
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
  suppress(violation, document) {
    if (violation.rule !== this.id) {
      return false;
    }
    return violation.spot.line() <= this.frontmatter(document);
  }
  frontmatter(document) {
    return document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys, row, last) => [last]
    })[0] || 0;
  }
}

module.exports = Redundant;
