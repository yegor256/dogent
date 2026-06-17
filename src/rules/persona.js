/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * Persona.
 *
 * Flags gratuitous role-play that opens a manifesto with a persona:
 * "You are a senior engineer", "Act as an expert reviewer", and the
 * like. The largest controlled study finds personas do not improve task
 * performance and can hurt, so a role-play line is pure context bloat
 * that adds no instruction. A standalone checker flags the line whose
 * head assigns the agent a role; its prompt hands the indirect persona
 * framing the regex misses to the AI oracle.
 */
class Persona {
  constructor() {
    this.id = 'persona';
  }
  prompt() {
    return `${this.id}: flag indirect persona or role-play framing that assigns the agent a role with no fixed keyword, since a persona adds no instruction`;
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
    const regex = /^(?<marker>\s*(?:[-*+]|\d+\.)\s+)?(?:you are an? |act as |imagine you are |pretend to be |as an? \w+,)/iu;
    const hit = regex.exec(mask(text));
    if (hit === null) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'persona assignment adds no instruction, delete it',
      new Region(uri, line, (hit.groups.marker || '').length + 1)
    )];
  }
}

module.exports = Persona;
