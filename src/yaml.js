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
 * the value, and the absolute line the key sits on. Folds a block scalar
 * value ("|" or ">") from its indented continuation lines into one value.
 * Nested mappings, blank lines, and comments hold no keys and yield nothing.
 */
class Yaml {
  constructor(text, base) {
    this.text = text;
    this.base = base;
  }
  pairs() {
    const lines = this.text.split('\n');
    return lines
      .map((line, index) => index)
      .filter((index) => /^[^\s#][^:]*:/u.test(lines[index]))
      .map((index) => this.pair(lines, index));
  }
  pair(lines, index) {
    const colon = lines[index].indexOf(':');
    const value = lines[index].slice(colon + 1).trim();
    return {
      key: lines[index].slice(0, colon).trim(),
      value: /^[|>][+-]?\d*$/u.test(value) ? Yaml.fold(lines, index) : value,
      row: this.base + index
    };
  }
  static fold(lines, index) {
    const rest = lines.slice(index + 1);
    const stop = rest.findIndex((line) => line.trim() !== '' && !/^\s/u.test(line));
    const end = stop === -1 ? rest.length : stop;
    return rest
      .slice(0, end)
      .map((line) => line.trim())
      .join(' ')
      .trim();
  }
}

module.exports = Yaml;
