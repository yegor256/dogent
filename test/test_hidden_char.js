/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const HiddenChar = require('../src/rules/hidden-char');

describe('HiddenChar', () => {
  it('flags a zero-width space', () => {
    const doc = new Markdown('x.md', '# H\nTrim\u200Bfile.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      1,
      'a zero-width space must be flagged'
    );
  });
  it('flags a right-to-left override', () => {
    const doc = new Markdown('x.md', '# H\nName\u202Efile.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      1,
      'a right-to-left override must be flagged'
    );
  });
  it('accepts clean ASCII prose', () => {
    const doc = new Markdown('x.md', '# H\nTrim the file now.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      0,
      'clean ASCII prose must pass'
    );
  });
});
