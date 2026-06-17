/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * ToolClarity.
 *
 * Demands the exact name of a tool or command, never a bare generic
 * noun. An action verb such as "run", "use", or "invoke" pointed at
 * "the script" or "a command" leaves the agent guessing which one. The
 * mask blanks backticked spans first, so "run `npm test`" passes while
 * "run the script" gets flagged. Its prompt defers subtler vague
 * references to the AI oracle.
 */
class ToolClarity {
  constructor() {
    this.id = 'tool-clarity';
  }
  prompt() {
    return `${this.id}: flag any vague reference to a tool or command beyond the fixed list, and demand the exact name, path, or invocation instead`;
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
    const found = [];
    const regex = new RegExp(
      '\\b(?:run|use|call|invoke|execute|open)\\s+(?:the|a|an)\\s+' +
      '(?:script|tool|command|api|file|function)\\b',
      'giu'
    );
    const masked = mask(text);
    let hit = regex.exec(masked);
    while (hit !== null) {
      found.push(new Violation(
        this.id,
        'warning',
        `name the exact tool or command, not "${hit[0]}"`,
        new Region(uri, line, hit.index + 1)
      ));
      hit = regex.exec(masked);
    }
    return found;
  }
}

module.exports = ToolClarity;
