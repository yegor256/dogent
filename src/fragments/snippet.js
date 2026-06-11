/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Snippet.
 *
 * A fenced code block taken as bulk, carrying the whole block as raw
 * text and the line number where the fence opens.
 */
class Snippet {
  constructor(content, line) {
    this.content = content;
    this.row = line;
  }
  accept(visitor) {
    return visitor.snippet(this.content, this.row);
  }
}

module.exports = Snippet;
