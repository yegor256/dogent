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
  hint() {
    return 'Delete the duplicate instruction or reconcile the contradictory pair, so each instruction is stated once and never both ordered and forbidden across two lines.';
  }
  prompt() {
    return `${this.id}: flag an instruction that repeats another instruction word for word, or that logically contradicts another instruction about the very same subject, where one line orders exactly what another forbids; ignore lines that merely share a theme but govern different concerns, since complementary instructions never clash`;
  }
  violations() {
    return [];
  }
}

module.exports = Consistent;
