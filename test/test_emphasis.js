/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Emphasis = require('../src/rules/emphasis');

describe('Emphasis', () => {
  it('flags a curated all-caps word', () => {
    const doc = new Markdown('x.md', '# H\nThis step is IMPORTANT.').document();
    assert.strictEqual(
      new Emphasis().violations(doc).length,
      1,
      'a shouted "IMPORTANT" must be flagged'
    );
  });
  it('flags a run of consecutive all-caps words', () => {
    const doc = new Markdown('x.md', '# H\nRUN THE SUITE.').document();
    assert.strictEqual(
      new Emphasis().violations(doc).length,
      1,
      'a run of all-caps words must be flagged'
    );
  });
  it('flags repeated punctuation', () => {
    const doc = new Markdown('x.md', '# H\nNever skip review!!').document();
    assert.strictEqual(
      new Emphasis().violations(doc).length,
      1,
      'repeated punctuation must be flagged'
    );
  });
  it('accepts a lone acronym', () => {
    const doc = new Markdown('x.md', '# H\nReturn JSON to caller.').document();
    assert.strictEqual(
      new Emphasis().violations(doc).length,
      0,
      'a lone short acronym must not be flagged'
    );
  });
  it('accepts adjacent short acronyms', () => {
    const doc = new Markdown('x.md', '# H\nSend JSON HTTP payload.').document();
    assert.strictEqual(
      new Emphasis().violations(doc).length,
      0,
      'a run of short acronyms must not be flagged'
    );
  });
});
