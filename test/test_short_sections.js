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
});
