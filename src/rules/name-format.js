/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

/**
 * NameFormat.
 *
 * Demands that a SKILL.md frontmatter "name" read as kebab-case: lower
 * letters and digits joined by single hyphens, no leading or trailing
 * hyphen. Ignores every other file and leaves a missing name to the
 * frontmatter rule.
 */
class NameFormat {
  constructor() {
    this.id = 'name-format';
  }
  hint() {
    return 'Write the SKILL.md frontmatter name in kebab-case, using only lowercase letters and digits joined by single hyphens.';
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
    if (blocks.length === 0) {
      return [];
    }
    return this.check(blocks[0].find((pair) => pair.key === 'name'), uri);
  }
  check(name, uri) {
    if (!name || /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name.value)) {
      return [];
    }
    return [new Violation(
      this.id,
      'error',
      `name "${name.value}" must be kebab-case`,
      new Region(uri, name.row, 1)
    )];
  }
}

module.exports = NameFormat;
