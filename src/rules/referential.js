/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Referential.
 *
 * Demands that every line name its own subject. A standalone checker
 * flags a line that opens with a bare pronoun acting as the subject:
 * "it", "they", and "them" always, and "this", "that", "these", or
 * "those" only when a verb follows rather than a noun, so a determiner
 * like "These rules stay final" stays clean. Such a pronoun points at a
 * previous line, breaking the "one line, one instruction" contract. Its
 * prompt hands the subtler mid-line dangling references to the AI oracle.
 */
class Referential {
  constructor() {
    this.id = 'referential';
    this.verbs = new RegExp(
      '^(?:is|are|was|were|be|been|being|will|would|can|could|shall|' +
      'should|must|may|might|has|have|had|do|does|did|only|then|runs|' +
      'run|applies|apply|happens|happen|means|requires|needs|comes|' +
      'goes|makes|breaks|points|refers)$',
      'iu'
    );
  }
  hint() {
    return 'Open the line by naming its own subject instead of a bare pronoun, since a dangling pronoun points at another line and breaks one line, one instruction.';
  }
  prompt() {
    return `${this.id}: flag any line whose subject is a pronoun with no antecedent on the same line, including mid-line dangling references a head pattern misses`;
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
    const regex = /^(?<marker>\s*(?:[-*+]|\d+\.)\s+)?(?<pro>it|this|that|they|them|these|those)\b\s+(?<next>[\w']+)/iu;
    const hit = regex.exec(mask(text));
    if (hit === null) {
      return [];
    }
    const pronoun = hit.groups.pro.toLowerCase();
    const ambiguous = /^(?:this|that|these|those)$/u.test(pronoun);
    if (ambiguous && !this.verbs.test(hit.groups.next)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      `pronoun "${hit.groups.pro}" has no antecedent on this line, name the subject`,
      new Region(uri, line, (hit.groups.marker || '').length + 1)
    )];
  }
}

module.exports = Referential;
