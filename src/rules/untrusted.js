/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Untrusted.
 *
 * Guards against indirect prompt injection. When a line tells the agent
 * to act on external content — a verb like "read", "fetch", "open",
 * "follow", or "execute" applied to a "page", "url", "link", "email",
 * "file", "issue", "output", or "comment" — that content can carry
 * hidden instructions the agent then obeys. A standalone checker flags
 * such a line when it lacks a data-only guard ("as data", "do not
 * follow", "treat as untrusted", "inside delimiters"). Its prompt hands
 * the deeper judgement of source trust and guard sufficiency to the AI
 * oracle.
 */
class Untrusted {
  constructor() {
    this.id = 'untrusted';
  }
  hint() {
    return 'Add a data-only guard when an instruction consumes external content, telling the agent to treat it as untrusted and never follow embedded instructions.';
  }
  prompt() {
    return `${this.id}: judge whether a consumed source is genuinely untrusted external input and whether its data-only guard is sufficient against prompt injection`;
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
    const verb = /(?<!-)\b(?:read|fetch|open|follow|execute)\b(?!-)/iu;
    const source = /\b(?:page|url|link|email|file|issue|output|comment)\b/iu;
    const guard = /\b(?:as data|do not follow|treat as untrusted|inside delimiters|untrusted)\b/iu;
    if (!verb.test(masked) || !source.test(masked) || guard.test(masked)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'untrusted input consumed without a data-only guard',
      new Region(uri, line, 1)
    )];
  }
}

module.exports = Untrusted;
