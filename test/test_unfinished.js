/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Unfinished = require('../src/rules/unfinished');

describe('Unfinished flags', () => {
  it('flags a line carrying a TODO token', () => {
    const doc = new Markdown('x.md', '# H\nDocument the API. TODO: expand later.').document();
    assert.strictEqual(
      new Unfinished().violations(doc).length,
      1,
      'a line with a TODO token must be flagged'
    );
  });
  it('flags a line carrying an angle-bracket placeholder', () => {
    const doc = new Markdown('x.md', '# H\nRun the <placeholder>.').document();
    assert.strictEqual(
      new Unfinished().violations(doc).length,
      1,
      'a line with an unfilled placeholder must be flagged'
    );
  });
  it('flags a line ending in a bare ellipsis', () => {
    const doc = new Markdown('x.md', '# H\nKeep going...').document();
    assert.strictEqual(
      new Unfinished().violations(doc).length,
      1,
      'a line ending in an ellipsis must be flagged'
    );
  });
});

describe('Unfinished accepts', () => {
  it('accepts a finished imperative line', () => {
    const doc = new Markdown('x.md', '# H\nRun the build.').document();
    assert.strictEqual(
      new Unfinished().violations(doc).length,
      0,
      'a finished line must pass'
    );
  });
  it('ignores an angle-bracket placeholder inside inline code', () => {
    const doc = new Markdown(
      'x.md', '# H\nWrite output to `<basename>-corrected.srt`.'
    ).document();
    assert.strictEqual(
      new Unfinished().violations(doc).length,
      0,
      'a placeholder inside inline code must be skipped like a fenced snippet'
    );
  });
});

describe('Unfinished prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new Unfinished().prompt(),
      '',
      'the unfinished rule stays deterministic and out of the oracle'
    );
  });
});
