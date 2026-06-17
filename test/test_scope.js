/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Scope = require('../src/rules/scope');

describe('Scope', () => {
  it('leaves responsibility judgement to the oracle', () => {
    const doc = new Markdown('x.md', '# Build\nCompile it.\n# Deploy\nShip it.').document();
    assert.strictEqual(
      new Scope().violations(doc).length,
      0,
      'the standalone check must find nothing and defer to the oracle'
    );
  });
  it('exposes a prompt fragment about responsibility', () => {
    assert.ok(
      new Scope().prompt().includes('responsibility'),
      'the rule must ask the oracle to weigh the responsibility'
    );
  });
  it('exposes a prompt fragment recommending a split', () => {
    assert.ok(
      new Scope().prompt().includes('split'),
      'the rule must ask the oracle to recommend a split'
    );
  });
});
