/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Ordered = require('../src/rules/ordered');

describe('Ordered', () => {
  it('flags an unordered bullet with a sequence marker', () => {
    const doc = new Markdown('x.md', '# H\n- First, clone repo.').document();
    assert.strictEqual(
      new Ordered().violations(doc).length,
      1,
      'an unordered sequence step must be flagged'
    );
  });
  it('flags a then-marked unordered bullet', () => {
    const doc = new Markdown('x.md', '# H\n- Then run suite.').document();
    assert.strictEqual(
      new Ordered().violations(doc).length,
      1,
      'a "then" step in a bullet must be flagged'
    );
  });
  it('accepts a numbered step', () => {
    const doc = new Markdown('x.md', '# H\n1. First, clone repo.').document();
    assert.strictEqual(
      new Ordered().violations(doc).length,
      0,
      'a numbered sequence must pass'
    );
  });
  it('accepts an unordered bullet with no sequence marker', () => {
    const doc = new Markdown('x.md', '# H\n- Clone repo.').document();
    assert.strictEqual(
      new Ordered().violations(doc).length,
      0,
      'an unordered list with no order must pass'
    );
  });
  it('ignores a marker word inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n- Run `next` task.').document();
    assert.strictEqual(
      new Ordered().violations(doc).length,
      0,
      'a marker word inside inline code must not be flagged'
    );
  });
});

describe('Ordered prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Ordered().prompt().includes('ordered'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to demand a numbered list', () => {
    assert.ok(
      new Ordered().prompt().includes('numbered list'),
      'the prompt must hand implicit ordering to the oracle'
    );
  });
});
