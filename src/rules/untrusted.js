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
 * "file", "issue", or "comment" — that content can carry hidden
 * instructions the agent then obeys. A bare "output" is not a source,
 * since a skill usually reads its own output; only "command output" or
 * "external output" counts. A value attributed to an environment variable
 * ("environment variable", "env var", "$NAME", "from ... environment") is
 * host-supplied launch context, not fetched external content, so its line
 * is left alone. A data-only guard ("as data", "do not
 * follow", "treat as untrusted", "inside delimiters") declared once
 * anywhere in the file clears every consuming line, since these
 * manifestos are short and a Safety section is conventionally global, so
 * the guard need not be repeated on each line.
 */
class Untrusted {
  constructor() {
    this.id = 'untrusted';
  }
  hint() {
    return 'Add a data-only guard when an instruction consumes external content, telling the agent to treat it as untrusted and never follow embedded instructions.';
  }
  violations(document) {
    const uri = document.uri();
    const guard = /\b(?:as data|do not follow|treat as untrusted|inside delimiters|untrusted)\b/iu;
    if (guard.test(mask(document.text()))) {
      return [];
    }
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
    const source = /\b(?:page|url|link|email|file|issue|comment)\b|\b(?:command|external) output\b/iu;
    const env = /\benvironment variable\b|\benv var\b|\$[A-Za-z_]\w*|\bfrom\b[^.]*\benvironment\b/iu;
    if (!verb.test(masked) || !source.test(masked) || env.test(masked)) {
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
