/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * DescriptionVoice.
 *
 * Demands that a SKILL.md description stay in the third person, reading
 * as a capability statement like "Extracts tables ..." rather than a
 * first- or second-person sentence like "I extract ..." or "You can
 * use ...". It flags first- and second-person pronouns as whole words,
 * after dropping the trigger clause that opens with "Use when" so a
 * legitimate "Use when ..." phrase stays clean. Distinct from
 * description-triggers, which checks that a "when" clause exists, and
 * from description-length, which checks the size; this one checks the
 * grammatical voice.
 */
class DescriptionVoice {
  constructor() {
    this.id = 'description-voice';
    this.pronoun = /\b(?:I|we|you|your|my|our)\b/giu;
  }
  hint() {
    return 'Write the SKILL.md description as a third-person capability statement such as Extracts tables, never in first or second person.';
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const pair = this.description(document);
    if (pair === null) {
      return [];
    }
    return this.judge(pair, uri);
  }
  description(document) {
    const pairs = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (keys) => keys
    });
    const found = pairs.filter((pair) => pair.key === 'description');
    return found.length === 0 ? null : found[0];
  }
  judge(pair, uri) {
    const text = pair.value.replace(/use when.*$/isu, '');
    this.pronoun.lastIndex = 0;
    const hit = this.pronoun.exec(text);
    if (hit === null) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      `description must be third person, not "${hit[0]}"`,
      new Region(uri, pair.row, 1)
    )];
  }
}

module.exports = DescriptionVoice;
