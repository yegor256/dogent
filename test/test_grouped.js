/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Grouped = require('../src/rules/grouped');

describe('Grouped', () => {
  it('flags an instruction that precedes every section', () => {
    const doc = new Markdown('x.md', 'Sharpen knife').document();
    assert.strictEqual(
      new Grouped().violations(doc).length,
      1,
      'an instruction with no section above it must be flagged'
    );
  });
  it('accepts an instruction that sits under a section', () => {
    const doc = new Markdown('x.md', '# Kitchen\nSharpen knife').document();
    assert.strictEqual(
      new Grouped().violations(doc).length,
      0,
      'an instruction under a section must pass'
    );
  });
  it('never counts a frontmatter key as loose instruction', () => {
    const doc = new Markdown('SKILL.md', '---\nname: shut-gate\n---\n# Doors\nShut gate').document();
    assert.strictEqual(
      new Grouped().violations(doc).length,
      0,
      'frontmatter above the first section must not be flagged as loose'
    );
  });
});
