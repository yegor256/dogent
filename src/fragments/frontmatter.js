/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Frontmatter.
 *
 * The leading YAML block of a manifesto, already parsed into an ordered
 * list of key pairs, carrying the line where the opening fence sits.
 * Stands apart from prose so no prose rule ever sees its keys.
 */
class Frontmatter {
  constructor(pairs, line) {
    this.keys = pairs;
    this.row = line;
  }
  accept(visitor) {
    return visitor.frontmatter(this.keys, this.row);
  }
}

module.exports = Frontmatter;
