/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

const Violation = require('../violation');
const Region = require('../region');

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

/**
 * DeadImport.
 *
 * Flags `@path/to/file` imports that point to no file on disk.
 *
 * @todo #18:45min Detect circular import chains and depth above five
 *  levels so deeply nested manifesto imports fail with a clear violation,
 *  as requested in issue #18.
 */
class DeadImport {
  constructor() {
    this.id = 'dead-import';
  }
  violations(document) {
    return document.walk({
      header: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => [],
      prose: (line, row) => this.missing(document.uri(), line, row)
    });
  }
  missing(uri, line, row) {
    const base = path.dirname(uri);
    return imports(line)
      .filter((item) => !fs.existsSync(path.resolve(base, item.file)))
      .map((item) => new Violation(
        this.id,
        'error',
        `@-import target not found: ${item.file}`,
        new Region(uri, row, item.column)
      ));
  }
}

module.exports = DeadImport;
