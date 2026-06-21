/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Conditional = require('../src/rules/conditional');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Conditional', () => {
  it('flags a line with if and else', () => {
    const doc = new Markdown('x.md', '# H\nIf staging, run smoke tests, else run the suite.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      1,
      'a line carrying if and else must be flagged'
    );
  });
  it('flags a line with when and otherwise', () => {
    const doc = new Markdown('x.md', '# H\nWhen ready, deploy, otherwise hold.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      1,
      'a line carrying when and otherwise must be flagged'
    );
  });
  it('accepts a single if guard', () => {
    const doc = new Markdown('x.md', '# H\nIf staging, run smoke tests.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      0,
      'a line carrying one keyword must pass'
    );
  });
  it('ignores keywords inside a code span', () => {
    const doc = new Markdown('x.md', '# H\nRun `if else` as one token.').document();
    assert.strictEqual(
      new Conditional().violations(doc).length,
      0,
      'keywords inside inline code must not be flagged'
    );
  });
});

describe('Conditional suppress', () => {
  it('vetoes an oracle flag on a single when guard', () => {
    const doc = new Markdown('x.md', '# H\nWhen owner is another account, @-mention owner in one comment.').document();
    const flag = new Violation('conditional', 'warning', 'multi-branch conditional, split each case into its own command', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Conditional().suppress(flag, doc),
      true,
      'an oracle flag on a line with one keyword must be vetoed'
    );
  });
  it('vetoes an oracle flag on a keyword-free line', () => {
    const doc = new Markdown('x.md', '# H\nOffer to clarify in that comment.').document();
    const flag = new Violation('conditional', 'warning', 'multi-branch conditional, split each case into its own command', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Conditional().suppress(flag, doc),
      true,
      'an oracle flag on a line with no keyword must be vetoed'
    );
  });
  it('keeps an oracle flag on a line carrying two keywords', () => {
    const doc = new Markdown('x.md', '# H\nIf staging, run smoke tests, else run the suite.').document();
    const flag = new Violation('conditional', 'warning', 'multi-branch conditional, split each case into its own command', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Conditional().suppress(flag, doc),
      false,
      'an oracle flag on a genuine multi-branch line must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# H\nOffer to clarify in that comment.').document();
    const flag = new Violation('atomic', 'warning', 'line carries more than one instruction', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Conditional().suppress(flag, doc),
      false,
      'a flag raised by another rule must not be touched'
    );
  });
});

describe('Conditional prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Conditional().prompt().includes('conditional'),
      'the prompt must mention the rule id'
    );
  });
});
