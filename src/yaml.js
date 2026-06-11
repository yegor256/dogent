/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Yaml.
 *
 * A frontmatter block read as a flat YAML mapping. Splits itself line by
 * line and emits one pair per top-level "key: value", carrying the key,
 * the value, and the absolute line the key sits on. Nested mappings,
 * blank lines, and comments hold no keys and yield nothing.
 */
class Yaml {
  constructor(text, base) {
    this.text = text;
    this.base = base;
  }
  pairs() {
    return this.text
      .split('\n')
      .map((line, index) => ({line, row: this.base + index}))
      .filter((spot) => /^[^\s#][^:]*:/u.test(spot.line))
      .map((spot) => {
        const colon = spot.line.indexOf(':');
        return {
          key: spot.line.slice(0, colon).trim(),
          value: spot.line.slice(colon + 1).trim(),
          row: spot.row
        };
      });
  }
}

module.exports = Yaml;
