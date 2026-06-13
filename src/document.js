/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Document.
 *
 * An entire manifesto already parsed into an ordered collection of
 * fragments, ready to be walked by a rule that hunts for violations. It
 * also keeps the raw text, which the AI oracle reads verbatim.
 */
class Document {
  constructor(uri, fragments, content) {
    this.address = uri;
    this.pieces = fragments;
    this.body = content;
  }
  uri() {
    return this.address;
  }
  fragments() {
    return this.pieces;
  }
  text() {
    return this.body;
  }
  walk(visitor) {
    return this.pieces.reduce((all, piece) => all.concat(piece.accept(visitor)), []);
  }
}

module.exports = Document;
