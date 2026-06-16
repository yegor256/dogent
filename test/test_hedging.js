/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Hedging = require('../src/rules/hedging');

describe('Hedging', () => {
  it('flags hedge words in a soft instruction', () => {
    const doc = new Markdown(
      'x.md', '# H\nYou should usually try to keep functions small.'
    ).document();
    assert.ok(
      new Hedging().violations(doc).length > 0,
      'a line full of hedge words must be flagged'
    );
  });
  it('accepts a firm command', () => {
    const doc = new Markdown('x.md', '# H\nKeep functions small.').document();
    assert.strictEqual(
      new Hedging().violations(doc).length,
      0,
      'a firm command must pass'
    );
  });
  it('keeps "every" clear of the "very" boundary', () => {
    const doc = new Markdown('x.md', '# H\nApply every rule.').document();
    assert.strictEqual(
      new Hedging().violations(doc).length,
      0,
      'the word "every" must not trip the "very" hedge'
    );
  });
  it('ignores hedge words quoted inside inline code', () => {
    const doc = new Markdown(
      'x.md', '# H\nCut filler words like `very`, `really`, and `just`.'
    ).document();
    assert.strictEqual(
      new Hedging().violations(doc).length,
      0,
      'hedge words inside inline code must be skipped like fenced snippets'
    );
  });
  it('names the rule id in its prompt', () => {
    assert.ok(
      new Hedging().prompt().includes('hedging'),
      'the prompt must name the rule id'
    );
  });
  it('directs the oracle to catch conditional escape hatches', () => {
    assert.ok(
      new Hedging().prompt().includes('escape hatches'),
      'the prompt must hand subtler hedging to the oracle'
    );
  });
});
