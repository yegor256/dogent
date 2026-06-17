/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Concise = require('../src/rules/concise');

describe('Concise', () => {
  it('flags a file past the line budget', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.\nThree.').document();
    assert.strictEqual(
      new Concise(2).violations(doc).length,
      1,
      'a file longer than the budget must be flagged'
    );
  });
  it('accepts a file within the line budget', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.').document();
    assert.strictEqual(
      new Concise(200).violations(doc).length,
      0,
      'a short file must pass'
    );
  });
  it('ignores a lone trailing newline', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.\n').document();
    assert.strictEqual(
      new Concise(3).violations(doc).length,
      0,
      'a trailing blank line must not count toward the budget'
    );
  });
});

describe('Concise prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Concise(200).prompt().includes('concise'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to recommend referenced files', () => {
    assert.ok(
      new Concise(200).prompt().includes('referenced files'),
      'the prompt must recommend splitting into referenced files'
    );
  });
});
