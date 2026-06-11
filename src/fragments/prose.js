/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

/**
 * Prose.
 *
 * A single line of English prose, one instruction of a manifesto,
 * carrying its raw text and its line number.
 */
class Prose {
  constructor(content, line) {
    this.content = content;
    this.row = line;
  }
  accept(visitor) {
    return visitor.prose(this.content, this.row);
  }
}

module.exports = Prose;
