/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Atomic = require('../src/rules/atomic');

describe('Atomic', () => {
  it('flags two welded sentences on one line', () => {
    const doc = new Markdown('x.md', '# H\nParse the file and emit fragments.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      1,
      'a line with two welded verb phrases must be flagged'
    );
  });
  it('flags a semicolon-joined pair of instructions', () => {
    const doc = new Markdown('x.md', '# H\nRead line by line; never use a grammar.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      1,
      'a line joined by a semicolon must be flagged'
    );
  });
  it('accepts a single atomic instruction', () => {
    const doc = new Markdown('x.md', '# H\nParse the file.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      0,
      'a line with one instruction must pass'
    );
  });
  it('exposes the id through the prompt', () => {
    assert.ok(
      new Atomic().prompt().includes('atomic'),
      'the prompt must name the rule id'
    );
  });
});
