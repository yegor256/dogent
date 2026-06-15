/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Consistent.
 *
 * Demands that the manifesto never say one thing twice nor say two
 * things that fight each other. A duplicate instruction wastes the
 * context budget; a contradictory pair leaves the agent guessing which
 * order wins. Neither is visible line by line, so this check is pure
 * judgement: prompt() hands the whole comparison to the AI oracle and
 * violations() finds nothing on its own.
 */
class Consistent {
  constructor() {
    this.id = 'consistent';
  }
  prompt() {
    return `${this.id}: flag an instruction that repeats another instruction word for word, or that directly contradicts another instruction in the same file`;
  }
  violations() {
    return [];
  }
}

module.exports = Consistent;
