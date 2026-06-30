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
  it('accepts an acronym whose initials match a later gloss', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nFollow the AAA pattern (Arrange-Act-Assert) here.'
    ).document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'a gloss whose initials spell the acronym must license it'
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

describe('Jargon definitions', () => {
  it('accepts an acronym defined as expansion before parentheses', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nFind Virtual Private Network (VPN) client here.\nUse VPN again.'
    ).document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'an "Expansion (ACRONYM)" definition must license later mentions'
    );
  });
  it('accepts an acronym defined with "stands for"', () => {
    const doc = new Markdown('x.md', '# H\nICCQ stands for the code quality conference.\nVisit ICCQ.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'an "ACRONYM stands for ..." form must license later mentions'
    );
  });
  it('accepts an acronym defined with "Read X as"', () => {
    const doc = new Markdown('x.md', '# H\nRead IEEE as the engineering institute here.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'the "Read ACRONYM as ..." house convention must license it'
    );
  });
});

describe('Jargon allowlist', () => {
  it('accepts a filename on the allowlist', () => {
    const doc = new Markdown('x.md', '# H\nEdit the README now.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      0,
      'a non-acronym token such as README needs no expansion'
    );
  });
  it('still flags a token merely qualified by a following noun', () => {
    const doc = new Markdown('x.md', '# H\nPush the commit SHA upstream.').document();
    assert.strictEqual(
      new Jargon().violations(doc).length,
      1,
      'a following noun qualifies, it does not gloss, so SHA still flags'
    );
  });
});
