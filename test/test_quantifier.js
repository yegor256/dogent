/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Quantifier = require('../src/rules/quantifier');

describe('Quantifier flags', () => {
  it('flags a several quantity word', () => {
    const doc = new Markdown('x.md', '# H\nRun several checks.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      1,
      'a "several" amount must be flagged'
    );
  });
  it('flags an a few quantity phrase', () => {
    const doc = new Markdown('x.md', '# H\nAllow a few retries.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      1,
      'an "a few" amount must be flagged'
    );
  });
  it('flags a multiple quantity word', () => {
    const doc = new Markdown('x.md', '# H\nOpen multiple files.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      1,
      'a "multiple" amount must be flagged'
    );
  });
});

describe('Quantifier accepts', () => {
  it('accepts an exact count', () => {
    const doc = new Markdown('x.md', '# H\nAllow three retries.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      0,
      'an exact number must pass'
    );
  });
  it('ignores a quantity word inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nPass the `many` flag.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      0,
      'a quantity word inside inline code must not be flagged'
    );
  });
  it('ignores a quantity quoted inside a described thesis', () => {
    const doc = new Markdown('x.md', '# H\nArgue that many small repositories beat monorepos.').document();
    assert.strictEqual(
      new Quantifier().violations(doc).length,
      0,
      'a quantity inside an "argue that ..." thesis is subject matter'
    );
  });
});
