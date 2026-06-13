/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Empty = require('../src/rules/empty');

describe('Empty flags', () => {
  it('flags a hollow heading that is followed by a heading', () => {
    const doc = new Markdown('x.md', '## Draft\n## Final').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      2,
      'both hollow headings must be flagged'
    );
  });
  it('flags the last heading when the file ends after it', () => {
    const doc = new Markdown('x.md', '## Alone').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      1,
      'a heading with nothing after it must be flagged'
    );
  });
  it('flags a heading before a heading and a heading before EOF', () => {
    const doc = new Markdown('x.md', '## Draft\n## Final').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      2,
      'the heading before another heading and the one at EOF are both flagged'
    );
  });
  it('flags only the hollow heading in a mixed file', () => {
    const doc = new Markdown('x.md', '## Good\nRun lint.\n## Hollow\n## Also Good\nRun test.').document();
    const violations = new Empty().violations(doc);
    assert.strictEqual(
      violations.length,
      1,
      'only the hollow heading must be flagged'
    );
    assert.strictEqual(
      violations[0].spot.line(),
      3,
      'the violation must point at the hollow heading line'
    );
  });
});

describe('Empty accepts', () => {
  it('accepts a heading with prose beneath it', () => {
    const doc = new Markdown('x.md', '## Kitchen\nSharpen knife').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      0,
      'a heading followed by prose must pass'
    );
  });
  it('accepts a heading with bullets beneath it', () => {
    const doc = new Markdown('x.md', '## Knives\n- Sharpen\n- Clean').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      0,
      'a heading followed by bullets must pass'
    );
  });
  it('accepts a heading with a snippet beneath it', () => {
    const doc = new Markdown('x.md', '## Script\n```\nls\n```').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      0,
      'a heading followed by a snippet must pass'
    );
  });
});

describe('Empty edge', () => {
  it('flags a lone heading at end of file', () => {
    const doc = new Markdown('x.md', '## Edge').document();
    assert.strictEqual(
      new Empty().violations(doc).length,
      1,
      'a lone heading must still be flagged'
    );
  });
});

describe('Empty prompt', () => {
  it('offers a fragment for the oracle', () => {
    assert.ok(
      new Empty().prompt().startsWith('empty:'),
      'the fragment must name the empty rule for the oracle'
    );
  });
});

describe('Empty companion to Grouped', () => {
  it('together cover the section-instruction relationship', () => {
    const doc = new Markdown('x.md', '## A\nDo x.\n## B\n## C\nFix y.').document();
    const both = new Empty().violations(doc);
    assert.strictEqual(
      both.length,
      1,
      'empty finds the hollow B between A and C'
    );
  });
});
