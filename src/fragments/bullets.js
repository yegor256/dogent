/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Bullets.
 *
 * A composite fragment holding the inner pieces of one bullet list,
 * dispatching itself first and then every item it contains.
 */
class Bullets {
  constructor(items, line) {
    this.items = items;
    this.row = line;
  }
  accept(visitor) {
    return this.items.reduce(
      (all, item) => all.concat(item.accept(visitor)),
      [].concat(visitor.bullets(this.row))
    );
  }
}

module.exports = Bullets;
