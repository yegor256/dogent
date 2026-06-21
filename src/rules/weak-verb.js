/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Weak verb.
 *
 * Flags a leading imperative that names no concrete action: "handle",
 * "manage", "process", "support", "ensure", "maintain", "deal with",
 * "take care of", "work on". Each tells the agent to do something
 * unspecified, so the line carries no real instruction. The check fires
 * only on the first word of the line, leaving the same verb mid-sentence
 * alone, and stays apart from "vague" (adjectives) and "command"
 * (imperative form). The curated list already captures the catch-all
 * verbs, so prompt() returns an empty string and the AI oracle never
 * re-checks this rule; handing it to the oracle made it flag concrete
 * action verbs such as "clone", "verify", or "stop", far beyond the
 * narrow set of delegating verbs the rule targets.
 */
class WeakVerb {
  constructor() {
    this.id = 'weak-verb';
  }
  hint() {
    return 'Replace a vague leading verb such as handle or manage with a precise action verb that names exactly what to do.';
  }
  prompt() {
    return '';
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
    const regex = new RegExp(
      '^(?<lead>\\s*(?:[-*+]|\\d+\\.)?\\s*)' +
      '(?<verb>handle|manage|process|support|ensure|maintain|' +
      'deal with|take care of|work on)\\b',
      'iu'
    );
    const hit = regex.exec(masked);
    if (hit === null) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      `weak verb "${hit.groups.verb}" names no concrete action, use a precise verb`,
      new Region(uri, line, hit.groups.lead.length + 1)
    )];
  }
}

module.exports = WeakVerb;
