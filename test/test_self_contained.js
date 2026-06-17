/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const SelfContained = require('../src/rules/self-contained');

describe('SelfContained', () => {
  it('flags a mentioned-above reference', () => {
    const doc = new Markdown('x.md', '# H\nFollow the rule mentioned above.').document();
    assert.strictEqual(
      new SelfContained().violations(doc).length,
      1,
      'a "mentioned above" reference must be flagged'
    );
  });
  it('flags a section-below reference', () => {
    const doc = new Markdown('x.md', '# H\nSee the section below for details.').document();
    assert.strictEqual(
      new SelfContained().violations(doc).length,
      1,
      'a "section below" reference must be flagged'
    );
  });
  it('accepts a concrete markdown link', () => {
    const doc = new Markdown('x.md', '# H\nFollow the [setup guide](#setup).').document();
    assert.strictEqual(
      new SelfContained().violations(doc).length,
      0,
      'a line pointing through a markdown link must pass'
    );
  });
  it('ignores a reference inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`see below` is a token.').document();
    assert.strictEqual(
      new SelfContained().violations(doc).length,
      0,
      'a reference inside inline code must not be flagged'
    );
  });
});

describe('SelfContained prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new SelfContained().prompt().includes('self-contained'),
      'the prompt must mention the rule id'
    );
  });
});
