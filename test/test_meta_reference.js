/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const MetaReference = require('../src/rules/meta-reference');

describe('MetaReference', () => {
  it('flags an "as an AI" self-reference', () => {
    const doc = new Markdown('x.md', '# H\nAs an AI, you cannot browse.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      1,
      'an "as an AI" framing must be flagged'
    );
  });
  it('flags a "these instructions" self-reference', () => {
    const doc = new Markdown('x.md', '# H\nThese instructions are final.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      1,
      'a "these instructions" framing must be flagged'
    );
  });
  it('accepts a plain command', () => {
    const doc = new Markdown('x.md', '# H\nRun the tests.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a plain command must pass'
    );
  });
  it('ignores a self-reference inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`this prompt` is a token.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a self-reference inside inline code must not be flagged'
    );
  });
  it('stays disjoint from persona role assignment', () => {
    const doc = new Markdown('x.md', '# H\nAct as a reviewer.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a persona role assignment must not be flagged by meta-reference'
    );
  });
});
