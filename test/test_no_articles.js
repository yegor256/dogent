/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const NoArticles = require('../src/rules/no-articles');

describe('NoArticles', () => {
  it('flags the article "the"', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      1,
      'a line carrying "the" must be flagged'
    );
  });
  it('accepts a line free of articles', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      0,
      'a line without articles must pass'
    );
  });
});
