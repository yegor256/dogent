/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const NameFormat = require('../src/rules/name-format');

describe('NameFormat', () => {
  it('flags a skill whose name is not kebab-case', () => {
    const text = '---\nname: Review-Code\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 1, 'a non-kebab name must be flagged'
    );
  });
  it('accepts a skill whose name is kebab-case', () => {
    const text = '---\nname: code-review\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 0, 'a kebab-case name must pass'
    );
  });
  it('ignores a name on a file that is not a skill', () => {
    const text = '---\nname: Review-Code\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('CLAUDE.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 0, 'a non-skill file must escape the check'
    );
  });
});
