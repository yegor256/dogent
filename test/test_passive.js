/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Passive = require('../src/rules/passive');

describe('Passive', () => {
  it('flags a must-be-validated line', () => {
    const doc = new Markdown('x.md', '# H\nThe input must be validated.').document();
    assert.strictEqual(
      new Passive().violations(doc).length,
      1,
      'a "be validated" line must be flagged'
    );
  });
  it('flags an are-emitted line', () => {
    const doc = new Markdown('x.md', '# H\nFragments are emitted in order.').document();
    assert.strictEqual(
      new Passive().violations(doc).length,
      1,
      'an "are emitted" line must be flagged'
    );
  });
  it('accepts an imperative line', () => {
    const doc = new Markdown('x.md', '# H\nValidate the input.').document();
    assert.strictEqual(
      new Passive().violations(doc).length,
      0,
      'an active imperative line must pass'
    );
  });
  it('accepts an attributive participle before a noun', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nWhen owner is authenticated account, file issue and stop.'
    ).document();
    assert.strictEqual(
      new Passive().violations(doc).length,
      0,
      'a participle modifying a following noun is not passive voice'
    );
  });
});
