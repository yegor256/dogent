/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Emoji = require('../src/rules/emoji');

describe('Emoji', () => {
  it('flags a decorative emoji', () => {
    const doc = new Markdown('x.md', '# H\nShip it \u{1F680} now.').document();
    assert.strictEqual(
      new Emoji().violations(doc).length,
      1,
      'a decorative emoji must be flagged'
    );
  });
  it('accepts plain ASCII prose', () => {
    const doc = new Markdown('x.md', '# H\nShip it now.').document();
    assert.strictEqual(
      new Emoji().violations(doc).length,
      0,
      'a line of plain ASCII prose must pass'
    );
  });
  it('ignores an emoji inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nShow the `\u{1F680}` glyph.').document();
    assert.strictEqual(
      new Emoji().violations(doc).length,
      0,
      'an emoji inside inline code must not be flagged'
    );
  });
});

describe('Emoji prompt', () => {
  it('returns an empty prompt', () => {
    assert.strictEqual(
      new Emoji().prompt(),
      '',
      'the prompt must be empty for a deterministic rule'
    );
  });
});
