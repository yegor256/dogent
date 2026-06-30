/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const path = require('path');

const Violation = require('../violation');
const Region = require('../region');

/**
 * NameMatchesDir.
 *
 * Demands that a SKILL.md frontmatter "name" equal the name of the
 * directory that holds the file. The check applies only to SKILL.md
 * and stays silent when the file carries no "name" key. A dot-prefixed
 * parent directory is exempt, since such a directory is conventionally a
 * generated, hidden copy whose frontmatter "name" must stay the original
 * so the runtime still invokes the skill under its real name.
 */
class NameMatchesDir {
  constructor() {
    this.id = 'name-matches-dir';
  }
  hint() {
    return 'Rename the SKILL.md frontmatter name so it matches the name of the directory that holds the file.';
  }
  violations(document) {
    const uri = document.uri();
    if (uri.replace(/^.*\//u, '') !== 'SKILL.md') {
      return [];
    }
    const blocks = document.walk({
      header: () => [],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: (pairs) => [pairs]
    });
    const name = blocks.length === 0
      ? null
      : blocks[0].find((pair) => pair.key === 'name');
    return this.mismatch(uri, name);
  }
  mismatch(uri, name) {
    const parent = path.basename(path.dirname(path.resolve(uri)));
    if (!name || name.value === parent || parent.startsWith('.')) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `name "${name.value}" must match directory "${parent}"`,
      new Region(uri, name.row, 1)
    )];
  }
}

module.exports = NameMatchesDir;
