/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DuplicateSection = require('../src/rules/duplicate-section');

describe('DuplicateSection', () => {
  it('flags two identical headings', () => {
    const doc = new Markdown('x.md', '# T\n## Rules\nDo a.\n## Rules\nDo b.').document();
    assert.strictEqual(
      new DuplicateSection().violations(doc).length,
      1,
      'a repeated heading must be flagged'
    );
  });
  it('flags case and space insensitively', () => {
    const doc = new Markdown('x.md', '# T\n## Set Up\nx\n##  set up\ny').document();
    assert.strictEqual(
      new DuplicateSection().violations(doc).length,
      1,
      'a heading differing only by case and spacing must be flagged'
    );
  });
  it('flags a heading repeated with closing hashes', () => {
    const doc = new Markdown('x.md', '# T\n## Rules\nDo a.\n## Rules ##\nDo b.').document();
    assert.strictEqual(
      new DuplicateSection().violations(doc).length,
      1,
      'closing hashes must not hide a repeated heading'
    );
  });
});

describe('DuplicateSection acceptance', () => {
  it('accepts distinct headings', () => {
    const doc = new Markdown('x.md', '# T\n## Build\nx\n## Test\ny').document();
    assert.strictEqual(
      new DuplicateSection().violations(doc).length,
      0,
      'distinct headings must not be flagged'
    );
  });
  it('keeps an attached hash distinct', () => {
    const doc = new Markdown('x.md', '# T\n## Rules\nDo a.\n## Rules#\nDo b.').document();
    assert.strictEqual(
      new DuplicateSection().violations(doc).length,
      0,
      'an attached hash is literal content, so the names differ'
    );
  });
});
