/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const AmbiguousOr = require('../src/rules/ambiguous-or');

describe('AmbiguousOr', () => {
  it('flags an and/or alternative', () => {
    const doc = new Markdown('x.md', '# H\nLint and/or format.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      1,
      'an "and/or" alternative must be flagged'
    );
  });
  it('flags a slashed alternative', () => {
    const doc = new Markdown('x.md', '# H\nUse tabs/spaces.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      1,
      'a slashed word alternative must be flagged'
    );
  });
  it('accepts a backticked path', () => {
    const doc = new Markdown('x.md', '# H\nEdit the `src/app` folder.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      0,
      'a backticked path must not be flagged'
    );
  });
  it('accepts a plain command', () => {
    const doc = new Markdown('x.md', '# H\nFormat the whole file.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      0,
      'a plain command must pass'
    );
  });
});

describe('AmbiguousOr prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new AmbiguousOr().prompt().includes('ambiguous-or'),
      'the prompt must mention the rule id'
    );
  });
});
