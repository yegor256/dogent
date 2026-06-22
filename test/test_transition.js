/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Transition = require('../src/rules/transition');

describe('Transition', () => {
  it('flags a leading "furthermore" connector', () => {
    const doc = new Markdown('x.md', '# H\nFurthermore, run the tests.').document();
    assert.ok(
      new Transition().violations(doc).length > 0,
      'a leading discourse connector must be flagged'
    );
  });
  it('flags a leading "in summary" connector', () => {
    const doc = new Markdown('x.md', '# H\nIn summary, keep it small.').document();
    assert.ok(
      new Transition().violations(doc).length > 0,
      'a leading multi-word connector must be flagged'
    );
  });
  it('accepts a plain command', () => {
    const doc = new Markdown('x.md', '# H\nRun the tests.').document();
    assert.strictEqual(
      new Transition().violations(doc).length, 0, 'a plain command must pass'
    );
  });
  it('accepts a line with no leading connector', () => {
    const doc = new Markdown('x.md', '# H\nKeep it small for clarity.').document();
    assert.strictEqual(
      new Transition().violations(doc).length, 0, 'no leading connector must pass'
    );
  });
  it('ignores a connector inside inline code', () => {
    const doc = new Markdown('x.md', '# H\n`Furthermore` is a word.').document();
    assert.strictEqual(
      new Transition().violations(doc).length, 0, 'a code span must be skipped'
    );
  });
});
