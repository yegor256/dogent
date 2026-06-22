/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Done = require('../src/rules/done');

describe('Done', () => {
  it('flags a skill with no completion check', () => {
    const text = '# Build\nCompile sources\nShip binary';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Done().violations(doc).length,
      1,
      'a skill without a verification signal must be flagged'
    );
  });
  it('accepts a skill with a Verify section', () => {
    const text = '# Build\nCompile sources\n## Verify\nRun suite';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Done().violations(doc).length,
      0,
      'a verify heading must satisfy the rule'
    );
  });
  it('accepts a skill that confirms the test passes', () => {
    const text = '# Build\nCompile sources\nConfirm the test passes.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Done().violations(doc).length,
      0,
      'a prose verification signal must satisfy the rule'
    );
  });
  it('ignores a file that is not a skill', () => {
    const text = '# Build\nCompile sources\nShip binary';
    const doc = new Markdown('CLAUDE.md', text).document();
    assert.strictEqual(
      new Done().violations(doc).length,
      0,
      'a non-skill file must escape the completion check'
    );
  });
});
