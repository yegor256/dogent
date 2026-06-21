/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const NoArticles = require('../src/rules/no-articles');

describe('NoArticles', () => {
  it('flags the article "the"', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      1,
      'a line carrying "the" must be flagged'
    );
  });
  it('accepts a line free of articles', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      0,
      'a line without articles must pass'
    );
  });
  it('ignores an article quoted inside inline code', () => {
    const doc = new Markdown(
      'x.md', '# H\nReplace `the reasons are structural` with specifics.'
    ).document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      0,
      'an article inside inline code must be skipped like a fenced snippet'
    );
  });
  it('ignores an article inside a frontmatter slug', () => {
    const doc = new Markdown('SKILL.md', '---\nname: submit-an-issue\n---\n# H').document();
    assert.strictEqual(
      new NoArticles().violations(doc).length,
      0,
      'an article inside frontmatter must escape the prose rule'
    );
  });
});

describe('NoArticles prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new NoArticles().prompt(),
      '',
      'the no-articles rule stays deterministic and out of the oracle'
    );
  });
});
