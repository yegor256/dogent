/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Budget = require('../src/rules/budget');

describe('Budget flags', () => {
  it('flags a file that exceeds the instruction budget', () => {
    const body = `# Kitchen\n${'Wash plate.\n'.repeat(3)}`;
    const doc = new Markdown('x.md', body).document();
    assert.strictEqual(
      new Budget(2).violations(doc).length,
      1,
      'a file with three instructions must be flagged'
    );
  });
});

describe('Budget accepts', () => {
  it('accepts a file within the instruction budget', () => {
    const body = `# Kitchen\n${'Wash plate.\n'.repeat(2)}`;
    const doc = new Markdown('x.md', body).document();
    assert.strictEqual(
      new Budget(2).violations(doc).length,
      0,
      'a file with two instructions must pass'
    );
  });
});

describe('Budget reports', () => {
  it('reports the total instruction count in the message', () => {
    const body = `# Kitchen\n${'Wash plate.\n'.repeat(3)}`;
    const doc = new Markdown('x.md', body).document();
    assert.strictEqual(
      new Budget(2).violations(doc)[0].message,
      'file holds 3 instructions, budget 2, split the manifesto',
      'the message must name the true count and cap'
    );
  });
});

describe('Budget prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new Budget(60).prompt(),
      '',
      'the budget rule stays deterministic and out of the oracle'
    );
  });
});
