/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Crowded = require('../src/rules/crowded');

describe('Crowded flags', () => {
  it('flags a section that exceeds the instruction limit', () => {
    const body = `# Kitchen\n${'Wash plate.\n'.repeat(11)}`;
    const doc = new Markdown('x.md', body).document();
    assert.strictEqual(
      new Crowded(10).violations(doc).length,
      1,
      'a section with eleven instructions must be flagged'
    );
  });
});

describe('Crowded accepts', () => {
  it('accepts a section within the instruction limit', () => {
    const body = `# Kitchen\n${'Wash plate.\n'.repeat(10)}`;
    const doc = new Markdown('x.md', body).document();
    assert.strictEqual(
      new Crowded(10).violations(doc).length,
      0,
      'a section with ten instructions must pass'
    );
  });
});

describe('Crowded prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new Crowded(10).prompt(),
      '',
      'the crowded rule stays deterministic and out of the oracle'
    );
  });
});
