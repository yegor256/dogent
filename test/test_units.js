/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Units = require('../src/rules/units');

describe('Units', () => {
  it('flags a bare ceiling number', () => {
    const doc = new Markdown('x.md', '# H\nKeep lines under 80.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      1,
      'a bare number naming no unit must be flagged'
    );
  });
  it('flags a bare delay number', () => {
    const doc = new Markdown('x.md', '# H\nWait 30 before retry.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      1,
      'a bare delay without a unit must be flagged'
    );
  });
  it('accepts a number carrying a unit', () => {
    const doc = new Markdown('x.md', '# H\nWait 30s before retry.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      0,
      'a number with a unit must pass'
    );
  });
  it('accepts a number carrying a spelled unit', () => {
    const doc = new Markdown('x.md', '# H\nKeep lines under 80 symbols.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      0,
      'a number followed by a unit word must pass'
    );
  });
});

describe('Units exemptions', () => {
  it('accepts a numbered list ordinal', () => {
    const doc = new Markdown('x.md', '# H\n1. Sharpen it.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      0,
      'a leading list ordinal must pass'
    );
  });
  it('accepts a version number', () => {
    const doc = new Markdown('x.md', '# H\nUse version 1.2 now.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      0,
      'a decimal version must pass'
    );
  });
  it('ignores a number inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nPass the `8` value.').document();
    assert.strictEqual(
      new Units().violations(doc).length,
      0,
      'a number inside inline code must not be flagged'
    );
  });
});

describe('Units prompt', () => {
  it('mentions a unit in its prompt', () => {
    assert.ok(
      new Units().prompt().includes('unit'),
      'the prompt must mention a unit'
    );
  });
});
