/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Unique = require('../src/rules/unique');

describe('Unique', () => {
  it('flags an instruction that repeats another', () => {
    const doc = new Markdown('x.md', '# Tests\nWrite tests first.\nWrite first tests.').document();
    assert.strictEqual(
      new Unique().violations(doc).length,
      1,
      'a repeated instruction must be flagged'
    );
  });
  it('accepts a file with distinct instructions', () => {
    const doc = new Markdown('x.md', '# Tests\nWrite tests first.\nShip clean code.').document();
    assert.strictEqual(
      new Unique().violations(doc).length,
      0,
      'distinct instructions must pass'
    );
  });
  it('names the rule id in the prompt', () => {
    assert.ok(
      new Unique().prompt().includes('unique'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to catch same-meaning pairs', () => {
    assert.ok(
      new Unique().prompt().includes('same meaning'),
      'the prompt must hand semantic near-duplicates to the oracle'
    );
  });
});
