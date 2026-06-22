/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DescriptionTriggers = require('../src/rules/description-triggers');

describe('DescriptionTriggers', () => {
  it('flags a short description with no trigger', () => {
    const text = '---\nname: review\ndescription: Reviews code\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new DescriptionTriggers().violations(doc).length,
      1,
      'a description without a trigger must be flagged'
    );
  });
  it('accepts a description that says when to use the skill', () => {
    const text = '---\nname: review\ndescription: Use this skill when reviewing pull requests for bugs\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new DescriptionTriggers().violations(doc).length,
      0,
      'a description that names a trigger must pass'
    );
  });
  it('ignores a file that is not a skill', () => {
    const text = '---\nname: review\ndescription: Reviews code\n---\n# Doors\nShut gate';
    const doc = new Markdown('CLAUDE.md', text).document();
    assert.strictEqual(
      new DescriptionTriggers().violations(doc).length,
      0,
      'a non-skill file must escape the description schema'
    );
  });
});
