/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Rationale = require('../src/rules/rationale');

describe('Rationale', () => {
  it('flags a because line', () => {
    const doc = new Markdown('x.md', '# H\nBecause clarity matters, keep it short.').document();
    assert.strictEqual(
      new Rationale().violations(doc).length,
      1,
      'a line opening with "because" must be flagged'
    );
  });
  it('flags a this-keeps line', () => {
    const doc = new Markdown('x.md', '# H\nThis keeps the build fast.').document();
    assert.strictEqual(
      new Rationale().violations(doc).length,
      1,
      'a line opening with "this keeps" must be flagged'
    );
  });
  it('flags a the-reason line', () => {
    const doc = new Markdown('x.md', '# H\nThe reason is that tests catch regressions.').document();
    assert.strictEqual(
      new Rationale().violations(doc).length,
      1,
      'a line opening with "the reason" must be flagged'
    );
  });
});

describe('Rationale acceptance', () => {
  it('accepts a clean imperative', () => {
    const doc = new Markdown('x.md', '# H\nKeep the build fast.').document();
    assert.strictEqual(
      new Rationale().violations(doc).length,
      0,
      'a clean imperative line must pass'
    );
  });
  it('accepts an imperative containing so-that mid-line', () => {
    const doc = new Markdown('x.md', '# H\nRun tests so that regressions surface.').document();
    assert.strictEqual(
      new Rationale().violations(doc).length,
      0,
      'a marker buried mid-line must not be flagged'
    );
  });
});
