/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const ShortSections = require('../src/rules/short-sections');

describe('ShortSections', () => {
  it('flags a section name of four words', () => {
    const doc = new Markdown('x.md', '# Build And Ship Fast').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      1,
      'a four-word section name must be flagged'
    );
  });
  it('accepts a two-word section name', () => {
    const doc = new Markdown('x.md', '# Build Tools').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      0,
      'a two-word section name must pass'
    );
  });
  it('ignores a closing hash run when counting words', () => {
    const doc = new Markdown('x.md', '## Build And Ship ##').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      0,
      'closing hashes must not count as a word'
    );
  });
  it('still flags four words carrying a closing hash run', () => {
    const doc = new Markdown('x.md', '## Build And Ship Fast ##').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      1,
      'a closing hash run must not hide a too long name'
    );
  });
  it('flags a heading whose name is only closing hashes', () => {
    const doc = new Markdown('x.md', '## ###').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      1,
      'a heading without a name must be flagged'
    );
  });
  it('keeps an attached hash as part of the name', () => {
    const doc = new Markdown('x.md', '## Build And Ship#').document();
    assert.strictEqual(
      new ShortSections().violations(doc).length,
      0,
      'an attached hash is literal content, not a closer'
    );
  });
});
