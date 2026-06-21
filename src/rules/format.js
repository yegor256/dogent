/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * Format.
 *
 * Demands that a SKILL.md which produces output pin down that output's
 * shape. Structured-output generation grows far more reliable when the
 * expected format is declared and shown, while leaving it implicit
 * produces brittle, drifting output. A standalone checker flags a skill
 * whose instructions describe producing output (verbs like "produce",
 * "output", "return", "generate", "write", "emit") yet no section or
 * snippet declares the output shape. This is distinct from the example
 * rule: an example shows one case, a format spec defines the contract.
 * Its prompt asks the AI oracle whether the declared format pins the
 * deliverable down, demanding a machine-checkable schema only when the
 * output is structured data and accepting named fields with prose shapes
 * when the deliverable is prose.
 */
class Format {
  constructor() {
    this.id = 'format';
  }
  hint() {
    return 'Declare and show the exact output format whenever the skill generates output, since a pinned-down contract makes structured output far more reliable.';
  }
  prompt() {
    return `${this.id}: in a SKILL.md, judge whether the declared output format pins the deliverable down, demanding a machine-checkable schema only when the output is structured data and accepting named fields with prose shapes when the deliverable is prose, and flag a generating skill that pins down no format`;
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const heading = /^#{1,6}\s+.*\b(?:format|schema|structure|output)\b/iu;
    const verb = /\b(?:produces?|outputs?|returns?|generates?|writes?|emits?)\b/iu;
    const signals = document.walk({
      header: (text) => {
        if (heading.test(text)) {
          return ['declared'];
        }
        return [];
      },
      prose: (text) => {
        if (verb.test(text)) {
          return ['generates'];
        }
        return [];
      },
      snippet: () => ['declared'],
      bullets: () => [],
      frontmatter: () => []
    });
    if (!signals.includes('generates') || signals.includes('declared')) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'SKILL.md generates output but never declares its format',
      new Region(uri, 1, 1)
    )];
  }
}

module.exports = Format;
