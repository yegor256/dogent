/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Stale = require('../src/rules/stale');

describe('Stale', () => {
  it('flags a latest reference', () => {
    const doc = new Markdown('x.md', '# H\nUse the latest Node release.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a "the latest" reference must be flagged'
    );
  });
  it('flags an as-of-today reference', () => {
    const doc = new Markdown('x.md', '# H\nAs of today, prefer X.').document();
    assert.ok(
      new Stale().violations(doc).length >= 1,
      'a time-bound reference must be flagged'
    );
  });
  it('flags a hardcoded version literal', () => {
    const doc = new Markdown('x.md', '# H\nPin Node to 18.17.0 here.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a version literal must be flagged'
    );
  });
  it('ignores a version inside a fenced code block', () => {
    const doc = new Markdown('x.md', '# H\n```\nnode 18.17.0\n```').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a version inside a fence must not be flagged'
    );
  });
  it('accepts a durable rule', () => {
    const doc = new Markdown('x.md', '# H\nPin Node to one major release.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a durable rule must pass'
    );
  });
});

describe('Stale prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Stale().prompt().includes('stale'),
      'the prompt must mention the rule id'
    );
  });
});
