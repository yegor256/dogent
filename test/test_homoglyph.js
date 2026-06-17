/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Homoglyph = require('../src/rules/homoglyph');

const CYRILLIC_A = String.fromCodePoint(0x0430);
const GREEK_O = String.fromCodePoint(0x03BF);

describe('Homoglyph', () => {
  it('flags a Cyrillic look-alike', () => {
    const doc = new Markdown('x.md', `# H\nS${CYRILLIC_A}ve it.`).document();
    assert.strictEqual(
      new Homoglyph().violations(doc).length,
      1,
      'a Cyrillic look-alike letter must be flagged'
    );
  });
  it('flags a Greek look-alike', () => {
    const doc = new Markdown('x.md', `# H\nN${GREEK_O}te it.`).document();
    assert.strictEqual(
      new Homoglyph().violations(doc).length,
      1,
      'a Greek look-alike letter must be flagged'
    );
  });
  it('accepts pure ASCII prose', () => {
    const doc = new Markdown('x.md', '# H\nSave the file now.').document();
    assert.strictEqual(
      new Homoglyph().violations(doc).length,
      0,
      'plain ASCII prose must pass'
    );
  });
});

describe('Homoglyph prompt', () => {
  it('returns an empty prompt', () => {
    assert.strictEqual(
      new Homoglyph().prompt(),
      '',
      'the prompt must be empty'
    );
  });
});
