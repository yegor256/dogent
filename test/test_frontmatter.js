/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Frontmatter = require('../src/rules/frontmatter');

const rule = () => new Frontmatter(
  'SKILL.md',
  ['name', 'description'],
  ['name', 'description', 'license', 'allowed-tools']
);

describe('Frontmatter', () => {
  it('flags a skill that opens without frontmatter', () => {
    const doc = new Markdown('SKILL.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      rule().violations(doc).length, 1, 'a skill with no frontmatter must be flagged'
    );
  });
  it('accepts a skill that declares every required key', () => {
    const text = '---\nname: shut-gate\ndescription: Shut gate\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      rule().violations(doc).length, 0, 'a skill with name and description must pass'
    );
  });
  it('flags a skill that drops a required key', () => {
    const text = '---\nname: shut-gate\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      rule().violations(doc).length, 1, 'a missing required key must be flagged'
    );
  });
  it('flags a frontmatter key outside the allowed set', () => {
    const text = '---\nname: shut-gate\ndescription: Shut gate\nmood: bold\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      rule().violations(doc).length, 1, 'a key outside the allowed set must be flagged'
    );
  });
  it('ignores frontmatter on a file that is not a skill', () => {
    const text = '---\nmood: bold\n---\n# Doors\nShut gate';
    const doc = new Markdown('CLAUDE.md', text).document();
    assert.strictEqual(
      rule().violations(doc).length, 0, 'a non-skill file must escape the skill schema'
    );
  });
});
