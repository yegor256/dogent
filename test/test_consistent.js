/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Consistent = require('../src/rules/consistent');

describe('Consistent', () => {
  it('leaves duplicate and conflict hunting to the oracle', () => {
    const doc = new Markdown('x.md', '# Tabs\nIndent with tabs.\nIndent with spaces.').document();
    assert.strictEqual(
      new Consistent().violations(doc).length,
      0,
      'the standalone check must find nothing and defer to the oracle'
    );
  });
  it('exposes a prompt fragment for the oracle', () => {
    assert.ok(
      new Consistent().prompt().includes('contradicts'),
      'the rule must ask the oracle to flag contradicting instructions'
    );
  });
  it('spares complementary instructions about different concerns', () => {
    assert.ok(
      new Consistent().prompt().includes('different concerns'),
      'the rule must ignore lines that only share a theme'
    );
  });
});
