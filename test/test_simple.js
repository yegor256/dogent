/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Simple = require('../src/rules/simple');

describe('Simple', () => {
  it('flags a tangled multi-clause line', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nIf the input is valid, and no error occurred, then emit the result, unless verbose.'
    ).document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      1,
      'a tangled multi-clause line must be flagged'
    );
  });
  it('accepts a short imperative line', () => {
    const doc = new Markdown('x.md', '# H\nValidate the input.').document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'a short imperative line must pass'
    );
  });
  it('accepts one conjunction with one comma', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nRun standalone by default, call AI only when token exists.'
    ).document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'one conjunction with one comma must stay below threshold'
    );
  });
  it('exposes its id in the prompt', () => {
    assert.ok(
      new Simple().prompt().includes('simple'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to weigh clause depth', () => {
    assert.ok(
      new Simple().prompt().includes('clause depth'),
      'the prompt must hand true clause-depth analysis to the oracle'
    );
  });
});
