/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Conditional = require('../src/rules/conditional');

describe('Conditional', () => {
  it('flags a line with if and else', () => {
    const doc = new Markdown('x.md', '# H\nIf staging, run smoke tests, else run the suite.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      1,
      'a line carrying if and else must be flagged'
    );
  });
  it('flags a line with when and otherwise', () => {
    const doc = new Markdown('x.md', '# H\nWhen ready, deploy, otherwise hold.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      1,
      'a line carrying when and otherwise must be flagged'
    );
  });
  it('accepts a single if guard', () => {
    const doc = new Markdown('x.md', '# H\nIf staging, run smoke tests.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      0,
      'a line carrying one keyword must pass'
    );
  });
  it('ignores keywords inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nRun `if else` as one token.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      0,
      'keywords inside inline code must not be flagged'
    );
  });
});

describe('Conditional prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Conditional().prompt().includes('conditional'),
      'the prompt must mention the rule id'
    );
  });
});
