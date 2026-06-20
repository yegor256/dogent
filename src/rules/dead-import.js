/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

const Violation = require('../violation');
const Region = require('../region');
const Markdown = require('../markdown');

const imports = (line) => {
  const found = [];
  const pattern = /(?<lead>^|\s)@(?<file>\S+)/gu;
  let match = pattern.exec(line);
  while (match !== null) {
    found.push({
      file: match.groups.file.replace(/[.,:;!?]+$/u, ''),
      column: match.index + match.groups.lead.length + 1
    });
    match = pattern.exec(line);
  }
  return found;
};

const targets = (file) => {
  const base = path.dirname(file);
  try {
    return new Markdown(file, fs.readFileSync(file, 'utf8'))
      .document()
      .walk({
        header: () => [],
        snippet: () => [],
        bullets: () => [],
        frontmatter: () => [],
        prose: (line) => imports(line).map((item) => path.resolve(base, item.file))
      })
      .filter((target) => fs.existsSync(target));
  } catch {
    return [];
  }
};

/**
 * DeadImport.
 *
 * Flags `@path/to/file` imports that point to no file on disk, and
 * walks the chain of imports that do resolve: a chain that loops back
 * on itself, or that nests deeper than five levels, fails with a clear
 * violation rather than looping or loading forever in the host tool.
 */
class DeadImport {
  constructor() {
    this.id = 'dead-import';
    this.depth = 5;
  }
  hint() {
    return 'Fix or remove the @path import so it points to a real file, and break any circular or overly deep import chain the host tool cannot resolve.';
  }
  prompt() {
    return `${this.id}: flag any @path/to/file import that points to no file on disk; only an @-prefixed token counts as an import, so never treat a bare path in prose as one`;
  }
  violations(document) {
    const uri = document.uri();
    const base = path.dirname(uri);
    const links = document.walk({
      header: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => [],
      prose: (line, row) => imports(line).map(
        (item) => ({...item, target: path.resolve(base, item.file), row})
      )
    });
    return this.missing(uri, links).concat(this.chains(uri, links));
  }
  missing(uri, links) {
    return links
      .filter((link) => !fs.existsSync(link.target))
      .map((link) => new Violation(
        this.id,
        'error',
        `@-import target not found: ${link.file}`,
        new Region(uri, link.row, link.column)
      ));
  }
  chains(uri, links) {
    const root = path.resolve(uri);
    const found = [];
    links
      .filter((link) => fs.existsSync(link.target))
      .forEach((link) => {
        const flags = {cycle: false, deep: false};
        this.explore([root, link.target], 1, flags);
        if (flags.cycle) {
          found.push(this.flag(uri, link, `@-import chain is circular via ${link.file}`));
        }
        if (flags.deep) {
          found.push(this.flag(uri, link, `@-import chain nests deeper than ${this.depth} levels via ${link.file}`));
        }
      });
    return found;
  }
  explore(stack, depth, flags) {
    if (depth > this.depth) {
      flags.deep = true;
      return;
    }
    targets(stack[stack.length - 1]).forEach((target) => {
      if (stack.includes(target)) {
        flags.cycle = true;
        return;
      }
      this.explore(stack.concat(target), depth + 1, flags);
    });
  }
  flag(uri, link, message) {
    return new Violation(this.id, 'error', message, new Region(uri, link.row, link.column));
  }
}

module.exports = DeadImport;
