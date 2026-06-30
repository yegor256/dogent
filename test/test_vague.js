/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Vague = require('../src/rules/vague');

describe('Vague', () => {
  it('flags a properly qualifier', () => {
    const doc = new Markdown('x.md', '# H\nHandle errors properly.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      1,
      'a "properly" qualifier must be flagged'
    );
  });
  it('flags a clean qualifier', () => {
    const doc = new Markdown('x.md', '# H\nKeep the code clean.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      1,
      'a "clean" qualifier must be flagged'
    );
  });
  it('flags a fast qualifier', () => {
    const doc = new Markdown('x.md', '# H\nMake it fast.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      1,
      'a "fast" qualifier must be flagged'
    );
  });
  it('accepts a measurable criterion', () => {
    const doc = new Markdown('x.md', '# H\nReturn within two hundred milliseconds.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      0,
      'a concrete threshold must pass'
    );
  });
  it('ignores a qualifier inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nPass the `fast` flag.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      0,
      'a qualifier inside inline code must not be flagged'
    );
  });
});

describe('Vague described positions', () => {
  it('ignores a qualifier quoted inside a described thesis', () => {
    const doc = new Markdown('x.md', '# H\nArgue that many small repositories beat monorepos.').document();
    assert.strictEqual(
      new Vague().violations(doc).length,
      0,
      'a qualifier inside an "argue that ..." thesis is subject matter'
    );
  });
});
