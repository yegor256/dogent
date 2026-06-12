/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Punctuation = require('../src/rules/punctuation');

describe('Punctuation', () => {
  it('flags a sentence that opens in lower case', () => {
    const doc = new Markdown('x.md', '# H\nshut gate.').document();
    assert.strictEqual(
      new Punctuation().violations(doc).length,
      1,
      'a sentence opening in lower case must be flagged'
    );
  });
  it('flags a sentence that lacks a closing period', () => {
    const doc = new Markdown('x.md', '# H\nShut gate').document();
    assert.strictEqual(
      new Punctuation().violations(doc).length,
      1,
      'a sentence without a closing period must be flagged'
    );
  });
  it('accepts a sentence cased and stopped correctly', () => {
    const doc = new Markdown('x.md', '# H\nShut gate.').document();
    assert.strictEqual(
      new Punctuation().violations(doc).length,
      0,
      'a well-formed sentence must pass'
    );
  });
  it('leaves section headings untouched', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate.').document();
    assert.strictEqual(
      new Punctuation().violations(doc).length,
      0,
      'a heading cannot demand a closing period'
    );
  });
  it('inspects the text of a bullet beyond its marker', () => {
    const doc = new Markdown('x.md', '# H\n- shut gate.').document();
    assert.strictEqual(
      new Punctuation().violations(doc).length,
      1,
      'a bullet opening in lower case must be flagged'
    );
  });
});
