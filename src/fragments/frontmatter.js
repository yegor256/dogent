/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Frontmatter.
 *
 * The leading YAML block of a manifesto, already parsed into an ordered
 * list of key pairs, carrying the line where the opening fence sits and
 * the line where the closing fence sits. Stands apart from prose so no
 * prose rule ever sees its keys, and exposes its closing row so a
 * body-prose rule can veto an oracle flag that strays into the block.
 */
class Frontmatter {
  constructor(pairs, line, last) {
    this.keys = pairs;
    this.row = line;
    this.last = last;
  }
  accept(visitor) {
    return visitor.frontmatter(this.keys, this.row, this.last);
  }
}

module.exports = Frontmatter;
