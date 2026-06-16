/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const SectionLevel = require('../src/rules/section-level');

describe('SectionLevel', () => {
  it('accepts a lone leading title', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new SectionLevel().violations(doc).length,
      0,
      'a first-level heading that opens the file must pass as the title'
    );
  });
  it('flags a first-level heading below the title', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate\n# Gates\nLock it').document();
    assert.strictEqual(
      new SectionLevel().violations(doc).length,
      1,
      'a first-level heading after the title must be flagged'
    );
  });
  it('flags a third-level heading', () => {
    const doc = new Markdown('x.md', '### Doors\nShut gate').document();
    assert.strictEqual(
      new SectionLevel().violations(doc).length,
      1,
      'a third-level heading must be flagged'
    );
  });
  it('accepts a second-level heading', () => {
    const doc = new Markdown('x.md', '## Doors\nShut gate').document();
    assert.strictEqual(
      new SectionLevel().violations(doc).length,
      0,
      'a second-level heading must pass'
    );
  });
});

describe('SectionLevel prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new SectionLevel().prompt(),
      '',
      'the section-level rule stays deterministic and out of the oracle'
    );
  });
});
