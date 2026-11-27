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
 * the value, and the absolute line the key sits on. Decodes a quoted
 * string value into the scalar it spells: a single-quoted value doubles
 * its inner quotes, a double-quoted one carries YAML escapes. Folds a
 * block scalar value ("|" or ">") from its indented continuation lines
 * into one value. Nested mappings, blank lines, and comments hold no
 * keys and yield nothing.
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
      value: /^[|>][+-]?\d*$/u.test(value) ? Yaml.fold(lines, index) : Yaml.scalar(value),
      row: this.base + index
    };
  }
  static scalar(value) {
    const quote = value.length > 1 &&
      (value[0] === '"' || value[0] === "'") &&
      value[value.length - 1] === value[0]
      ? value[0]
      : null;
    if (quote === null) {
      return value;
    }
    const body = value.slice(1, -1);
    if (quote === "'") {
      return body.replace(/''/gu, "'");
    }
    return body.replace(
      /\\(?<code>x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|.)/gsu,
      (found, code) => Yaml.escaped(found, code)
    );
  }
  static escaped(found, code) {
    if (code.length === 1) {
      const signs = '0abtnvfre"/\\N_LP ';
      const marks = [
        '\u0000',
        '\u0007',
        '\u0008',
        '\t',
        '\n',
        '\u000B',
        '\u000C',
        '\r',
        '\u001B',
        '"',
        '/',
        '\\',
        '\u0085',
        '\u00A0',
        '\u2028',
        '\u2029',
        ' '
      ];
      const at = signs.indexOf(code);
      return at < 0 ? found : marks[at];
    }
    const point = Number.parseInt(code.slice(1), 16);
    return point > 0x10FFFF ? found : String.fromCodePoint(point);
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
