/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

const PATTERNS = [
  /\b(?:npm|npx|node|git|eslint|mocha|yarn|pnpm|cd|rm|mkdir|chmod|cat|sed|grep|curl|docker)\s+[\w./-]+/gu,
  /(?<![\w/.@])[\w-]+(?:\/[\w.-]+)+/gu,
  /(?<![\w/.@])[\w-]+\.(?:js|ts|jsx|tsx|json|md|ya?ml|sh|py|rb|go|rs|toml|cfg|lock|txt|xml|html|css)\b/gu,
  /(?<![\w-])(?:--[A-Za-z][\w-]*|-[A-Za-z])(?![\w])/gu
];

/**
 * InlineCode.
 *
 * When a command, path, filename, or flag sits bare in prose, the model
 * cannot cleanly tell the literal token from the surrounding words and
 * may reword or reformat it. Markdown inline code marks such a token as
 * literal, and consistent code-versus-prose marking measurably lowers
 * misinterpretation. This standalone check flags a bare literal — a
 * slashed path, a filename carrying a known extension, a CLI flag, or a
 * known shell command followed by an argument — once its inline-code
 * spans are masked away, so an already-backticked literal passes. It
 * leaves @-imports to the dead-import rule. Its prompt hands borderline
 * literals to the AI oracle.
 */
class InlineCode {
  constructor() {
    this.id = 'inline-code';
  }
  prompt() {
    return `${this.id}: flag a bare literal token (command, path, filename, or flag) that should be wrapped in backticks, judging borderline cases`;
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
    const spans = [];
    PATTERNS.forEach((pattern) => {
      let hit = pattern.exec(masked);
      while (hit !== null) {
        spans.push({token: hit[0], from: hit.index, to: hit.index + hit[0].length});
        hit = pattern.exec(masked);
      }
    });
    return InlineCode.prune(spans).map((span) => new Violation(
      this.id,
      'warning',
      `literal "${span.token}" must be wrapped in backticks`,
      new Region(uri, line, span.from + 1)
    ));
  }
  static prune(spans) {
    const ordered = spans.slice().sort((one, two) => one.from - two.from || two.to - one.to);
    const kept = [];
    ordered.forEach((span) => {
      if (!kept.some((other) => span.from >= other.from && span.to <= other.to)) {
        kept.push(span);
      }
    });
    return kept;
  }
}

module.exports = InlineCode;
