/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const WeakVerb = require('../src/rules/weak-verb');

describe('WeakVerb', () => {
  it('flags a leading handle verb', () => {
    const doc = new Markdown('x.md', '# H\nHandle errors.').document();
    assert.strictEqual(
      new WeakVerb().violations(doc).length,
      1,
      'a leading "handle" must be flagged'
    );
  });
  it('flags a leading manage verb', () => {
    const doc = new Markdown('x.md', '# H\nManage the cache.').document();
    assert.strictEqual(
      new WeakVerb().violations(doc).length,
      1,
      'a leading "manage" must be flagged'
    );
  });
  it('accepts a precise leading verb', () => {
    const doc = new Markdown('x.md', '# H\nRun the validation.').document();
    assert.strictEqual(
      new WeakVerb().violations(doc).length,
      0,
      'a precise leading verb must pass'
    );
  });
  it('ignores a weak verb inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`handle` errors fast.').document();
    assert.strictEqual(
      new WeakVerb().violations(doc).length,
      0,
      'a weak verb inside inline code must not be flagged'
    );
  });
});

describe('WeakVerb prompt', () => {
  it('directs the oracle toward a precise verb', () => {
    assert.ok(
      new WeakVerb().prompt().includes('precise'),
      'the prompt must ask the oracle for a precise verb'
    );
  });
});
