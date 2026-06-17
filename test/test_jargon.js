/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Jargon = require('../src/rules/jargon');

describe('Jargon', () => {
  it('flags an undefined acronym', () => {
    const doc = new Markdown('x.md', '# H\nUse RBAC widely.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      1,
      'an unexpanded acronym must be flagged'
    );
  });
  it('accepts an acronym expanded in parentheses', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nUse RBAC (role-based access control) here.\nUse RBAC again.'
    ).document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'a parenthetical expansion must license later mentions'
    );
  });
  it('accepts an allowlisted acronym', () => {
    const doc = new Markdown('x.md', '# H\nReturn JSON only.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'a well-known acronym needs no expansion'
    );
  });
  it('ignores an acronym inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`RBAC` is a token.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'an acronym inside inline code must not be flagged'
    );
  });
});

describe('Jargon prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Jargon().prompt().includes('jargon'),
      'the prompt must mention the rule id'
    );
  });
});
