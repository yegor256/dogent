/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Scope.
 *
 * Demands that one SKILL.md stay bound to a single coherent
 * responsibility. Agent reliability scales with specialisation: a
 * well-scoped single-stage skill beats a monolith that conflates
 * unrelated subtasks. Whether the sections cohere or diverge is not
 * visible line by line, so this check is pure judgement: prompt()
 * defers the verdict to the AI oracle and violations() finds nothing
 * on its own.
 */
class Scope {
  constructor() {
    this.id = 'scope';
  }
  prompt() {
    return `${this.id}: in a SKILL.md, judge whether the sections describe a single coherent responsibility or several unrelated ones, and recommend a split when they diverge`;
  }
  violations() {
    return [];
  }
}

module.exports = Scope;
