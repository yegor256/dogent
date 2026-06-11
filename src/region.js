/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Region.
 *
 * The exact place of a violation inside a file: the file itself, a
 * one-based line, and a one-based column. Knows how to project itself
 * into a SARIF physical location.
 */
class Region {
  constructor(uri, line, column) {
    this.address = uri;
    this.row = line;
    this.col = column;
  }
  uri() {
    return this.address;
  }
  line() {
    return this.row;
  }
  column() {
    return this.col;
  }
  sarif() {
    return {
      artifactLocation: {uri: this.address},
      region: {startLine: this.row, startColumn: this.col}
    };
  }
}

module.exports = Region;
