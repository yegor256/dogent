/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const NoArticles = require('../src/rules/no-articles');
const Violation = require('../src/violation');
const Region = require('../src/region');

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

describe('NoArticles suppress', () => {
  const flag = (line) => new Violation(
    'no-articles',
    'error',
    'article must be removed',
    new Region('x.md', line, 1)
  );
  it('vetoes an oracle flag landing on a heading', () => {
    const doc = new Markdown('x.md', '# Skills Repository\nShut gate').document();
    assert.strictEqual(
      new NoArticles().suppress(flag(1), doc),
      true,
      'a flag on a heading line must be vetoed'
    );
  });
  it('keeps an oracle flag landing on a prose line', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      new NoArticles().suppress(flag(2), doc),
      false,
      'a flag on a prose line must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# Skills Repository\nShut gate').document();
    const other = new Violation(
      'command', 'warning', 'sounds like a question', new Region('x.md', 1, 1)
    );
    assert.strictEqual(
      new NoArticles().suppress(other, doc),
      false,
      'only a no-articles flag may be vetoed by this guard'
    );
  });
});
