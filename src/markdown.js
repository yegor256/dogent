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
const Frontmatter = require('./fragments/frontmatter');
const Yaml = require('./yaml');

/**
 * Markdown.
 *
 * The raw text of a manifesto file. Reads itself line by line, holding
 * the context of the moment (inside a fence, inside a list), and emits
 * a Document of fragments. This is a line scanner, not a grammar.
 *
 * A wrapped continuation line, indented under an open bullet and
 * carrying no marker of its own, folds into the bullet it belongs to
 * rather than breaking the list and floating off as a stray paragraph.
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
    const body = this.content.replace(/\r\n?/gu, '\n');
    const lines = body.split('\n');
    let skip = 0;
    if (lines[0].trim() === '---') {
      const rest = lines.slice(1);
      const close = rest.findIndex((line) => line.trim() === '---');
      if (close !== -1) {
        const front = rest.slice(0, close).join('\n');
        skip = close + 2;
        pieces.push(new Frontmatter(new Yaml(front, 2).pairs(), 1, skip));
      }
    }
    lines.forEach((line, index) => {
      if (index < skip) {
        return;
      }
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
      if (items.length > 0 && /^\s+\S/u.test(line)) {
        const last = items[items.length - 1];
        items[items.length - 1] = new Prose(`${last.content} ${line.trim()}`, last.row);
        return;
      }
      flush();
      pieces.push(new Prose(line, row));
    });
    flush();
    if (fence !== '') {
      pieces.push(new Snippet(block.join('\n'), opened));
    }
    return new Document(this.address, pieces, body);
  }
}

module.exports = Markdown;
