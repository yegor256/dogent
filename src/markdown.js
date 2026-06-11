/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Document = require('./document');
const Header = require('./fragments/header');
const Prose = require('./fragments/prose');
const Bullets = require('./fragments/bullets');
const Snippet = require('./fragments/snippet');

/**
 * Markdown.
 *
 * The raw text of a manifesto file. Reads itself line by line, holding
 * the context of the moment (inside a fence, inside a list), and emits
 * a Document of fragments. This is a line scanner, not a grammar.
 *
 * @todo #1 Attach wrapped continuation lines to the bullet they belong
 *  to, instead of dropping their indentation context on the floor.
 */
class Markdown {
  constructor(uri, content) {
    this.address = uri;
    this.content = content;
  }
  document() {
    const pieces = [];
    let fence = '';
    let block = [];
    let opened = 0;
    let items = [];
    let started = 0;
    const flush = () => {
      if (items.length > 0) {
        pieces.push(new Bullets(items, started));
        items = [];
      }
    };
    this.content.split('\n').forEach((line, index) => {
      const row = index + 1;
      const mark = line.match(/^\s*(?<fence>```|~~~)/u);
      if (fence !== '') {
        block.push(line);
        if (mark && line.trim().indexOf(fence) === 0) {
          pieces.push(new Snippet(block.join('\n'), opened));
          fence = '';
          block = [];
        }
        return;
      }
      if (mark) {
        flush();
        ({fence} = mark.groups);
        block = [line];
        opened = row;
        return;
      }
      if (/^#{1,6}\s+/u.test(line)) {
        flush();
        pieces.push(new Header(line, row, line.match(/^#+/u)[0].length));
        return;
      }
      if (/^\s*(?:[-*+]|\d+\.)\s+/u.test(line)) {
        if (items.length === 0) {
          started = row;
        }
        items.push(new Prose(line, row));
        return;
      }
      if (/^\s*$/u.test(line)) {
        flush();
        return;
      }
      flush();
      pieces.push(new Prose(line, row));
    });
    flush();
    if (fence !== '') {
      pieces.push(new Snippet(block.join('\n'), opened));
    }
    return new Document(this.address, pieces);
  }
}

module.exports = Markdown;
