/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const HiddenChar = require('../src/rules/hidden-char');

describe('HiddenChar', () => {
  it('flags a zero-width space', () => {
    const doc = new Markdown('x.md', '# H\nTrim\u200Bfile.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      1,
      'a zero-width space must be flagged'
    );
  });
  it('flags a right-to-left override', () => {
    const doc = new Markdown('x.md', '# H\nName\u202Efile.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      1,
      'a right-to-left override must be flagged'
    );
  });
  it('accepts a U+FE0F that completes an emoji variation sequence', () => {
    const doc = new Markdown('x.md', '# H\nPick ❤️ to react.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      0,
      'a U+FE0F bound to an emoji base must pass as a presentation sequence'
    );
  });
  it('flags a lone U+FE0F not bound to an emoji base', () => {
    const doc = new Markdown('x.md', '# H\nTrim️file.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      1,
      'a U+FE0F following plain text is still a hidden character'
    );
  });
  it('points a snippet hit at its own row and column', () => {
    const doc = new Markdown('x.md', '# H\n```js\nconst x = 1;\na\u200Bb\n```').document();
    const found = new HiddenChar().violations(doc);
    assert.strictEqual(found.length, 1, 'a zero-width space inside a snippet must be flagged');
    assert.strictEqual(found[0].spot.line(), 4, 'the hit must land on the line hiding the character');
    assert.strictEqual(found[0].spot.column(), 2, 'the hit must land on the column of the character');
  });
  it('accepts clean ASCII prose', () => {
    const doc = new Markdown('x.md', '# H\nTrim the file now.').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      0,
      'clean ASCII prose must pass'
    );
  });
});
describe('HiddenChar inside a snippet', () => {
  it('accepts a U+FE0F completing an emoji sequence inside a snippet', () => {
    const doc = new Markdown('x.md', '# H\n```js\nconst x = 1;\nreact ❤️ here\n```').document();
    assert.strictEqual(
      new HiddenChar().violations(doc).length,
      0,
      'a U+FE0F bound to an emoji base inside a snippet must pass'
    );
  });
});
