/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Document.
 *
 * An entire manifesto already parsed into an ordered collection of
 * fragments, ready to be walked by a rule that hunts for violations.
 */
class Document {
  constructor(uri, fragments) {
    this.address = uri;
    this.pieces = fragments;
  }
  uri() {
    return this.address;
  }
  fragments() {
    return this.pieces;
  }
  walk(visitor) {
    return this.pieces.reduce((all, piece) => all.concat(piece.accept(visitor)), []);
  }
}

module.exports = Document;
