/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const CounterExample = require('../src/rules/counter-example');

describe('CounterExample', () => {
  it('flags a for-example-do-not line with a backticked sample', () => {
    const doc = new Markdown('x.md', '# H\nFor example, do not write `foo`.').document();
    assert.strictEqual(
      new CounterExample().violations(doc).length,
      1,
      'a counterexample carrying a backticked sample must be flagged'
    );
  });
  it('flags an instead-of-writing line with a quoted sample', () => {
    const doc = new Markdown('x.md', '# H\nInstead of writing "foo", do bar.').document();
    assert.strictEqual(
      new CounterExample().violations(doc).length,
      1,
      'a counterexample carrying a quoted sample must be flagged'
    );
  });
});

describe('CounterExample acceptance', () => {
  it('accepts a clean positive instruction', () => {
    const doc = new Markdown('x.md', '# H\nWrite clear code.').document();
    assert.strictEqual(
      new CounterExample().violations(doc).length,
      0,
      'a clean positive instruction must pass'
    );
  });
  it('accepts an introducer with no sample', () => {
    const doc = new Markdown('x.md', '# H\nA bad idea in general.').document();
    assert.strictEqual(
      new CounterExample().violations(doc).length,
      0,
      'an introducer without a sample must not be flagged'
    );
  });
});

describe('CounterExample prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new CounterExample().prompt().includes('counter-example'),
      'the prompt must mention the rule id'
    );
  });
});
