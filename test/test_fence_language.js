/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const FenceLanguage = require('../src/rules/fence-language');

describe('FenceLanguage', () => {
  it('flags a bare fence with no language', () => {
    const doc = new Markdown('x.md', '# H\n```\ncode\n```').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      1,
      'a fence with no language tag must be flagged'
    );
  });
  it('accepts a fence that names a language', () => {
    const doc = new Markdown('x.md', '# H\n```bash\ncode\n```').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      0,
      'a fence that declares a language must pass'
    );
  });
  it('flags a bare fence longer than three backticks', () => {
    const doc = new Markdown('x.md', '# H\n````\ncode\n````').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      1,
      'a bare longer backtick fence must be flagged'
    );
  });
  it('flags a bare fence longer than three tildes', () => {
    const doc = new Markdown('x.md', '# H\n~~~~\ncode\n~~~~').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      1,
      'a bare longer tilde fence must be flagged'
    );
  });
  it('accepts a longer backtick fence that names a language', () => {
    const doc = new Markdown('x.md', '# H\n````js\ncode\n````').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      0,
      'a longer backtick fence with a language must pass'
    );
  });
  it('accepts a longer tilde fence that names a language', () => {
    const doc = new Markdown('x.md', '# H\n~~~~js\ncode\n~~~~').document();
    assert.strictEqual(
      new FenceLanguage().violations(doc).length,
      0,
      'a longer tilde fence with a language must pass'
    );
  });
});
