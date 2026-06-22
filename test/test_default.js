/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Default = require('../src/rules/default');

describe('Default', () => {
  it('flags an optionally marker without a default', () => {
    const doc = new Markdown('x.md', '# H\nOptionally cache it.').document();
    assert.strictEqual(
      new Default().violations(doc).length,
      1,
      'an "optionally" marker with no default must be flagged'
    );
  });
  it('flags a you-may marker without a default', () => {
    const doc = new Markdown('x.md', '# H\nYou may retry.').document();
    assert.strictEqual(
      new Default().violations(doc).length,
      1,
      'a "you may" marker with no default must be flagged'
    );
  });
  it('accepts an optional line that states a default', () => {
    const doc = new Markdown('x.md', '# H\nOptionally cache it; by default skip it.').document();
    assert.strictEqual(
      new Default().violations(doc).length,
      0,
      'an optional line stating a default must pass'
    );
  });
  it('ignores a marker inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nPass `you may` text.').document();
    assert.strictEqual(
      new Default().violations(doc).length,
      0,
      'a marker inside inline code must not be flagged'
    );
  });
});
