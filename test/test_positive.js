/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Positive = require('../src/rules/positive');

describe('Positive', () => {
  it('flags a do-not line', () => {
    const doc = new Markdown('x.md', '# H\nDo not use mock data.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "do not" line must be flagged'
    );
  });
  it('flags a never line', () => {
    const doc = new Markdown('x.md', '# H\nNever edit the lockfile.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "never" line must be flagged'
    );
  });
  it('flags a contracted do-not line', () => {
    const doc = new Markdown('x.md', "# H\nDon't touch the cache.").document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "don\'t" line must be flagged'
    );
  });
  it('flags a banned bullet item', () => {
    const doc = new Markdown('x.md', '# H\n- Avoid global state.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a bullet whose head is a ban must be flagged'
    );
  });
});

describe('Positive acceptance', () => {
  it('accepts a positive imperative', () => {
    const doc = new Markdown('x.md', '# H\nOnly use real data.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a positive imperative line must pass'
    );
  });
  it('accepts a ban word used mid-line as a modifier', () => {
    const doc = new Markdown('x.md', '# H\nRead manifesto line by line, never through grammar.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a non-head ban word must not be flagged'
    );
  });
  it('ignores a ban hidden inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`do not` stands as a token.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a keyword inside inline code must not be flagged'
    );
  });
});

describe('Positive prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Positive().prompt().includes('positive'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to rewrite bans as positive imperatives', () => {
    assert.ok(
      new Positive().prompt().includes('positive imperative'),
      'the prompt must hand subtler bans to the oracle'
    );
  });
});
