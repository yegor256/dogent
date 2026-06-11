/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Header.
 *
 * A section heading line of a manifesto, carrying its raw text,
 * its line number, and its depth (the count of leading hashes).
 */
class Header {
  constructor(content, line, level) {
    this.content = content;
    this.row = line;
    this.depth = level;
  }
  accept(visitor) {
    return visitor.header(this.content, this.row, this.depth);
  }
}

module.exports = Header;
