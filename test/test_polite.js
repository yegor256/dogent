/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Polite = require('../src/rules/polite');

describe('Polite flags', () => {
  it('flags a please courtesy phrase', () => {
    const doc = new Markdown('x.md', '# H\nPlease validate input.').document();
    assert.strictEqual(
      new Polite().violations(doc).length,
      1,
      'a "please" must be flagged'
    );
  });
  it('flags a make sure to scaffolding phrase', () => {
    const doc = new Markdown('x.md', '# H\nMake sure to close the file.').document();
    assert.strictEqual(
      new Polite().violations(doc).length,
      1,
      'a "make sure to" must be flagged'
    );
  });
});

describe('Polite accepts', () => {
  it('accepts a plain command with no courtesy', () => {
    const doc = new Markdown('x.md', '# H\nValidate input.').document();
    assert.strictEqual(
      new Polite().violations(doc).length,
      0,
      'a bare command must pass'
    );
  });
});

describe('Polite prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new Polite().prompt(),
      '',
      'the polite rule stays deterministic and out of the oracle'
    );
  });
});
