/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const NameMatchesDir = require('../src/rules/name-matches-dir');

describe('NameMatchesDir', () => {
  it('accepts a name that equals its parent directory', () => {
    const text = '---\nname: code-review\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('skills/code-review/SKILL.md', text).document();
    assert.strictEqual(
      new NameMatchesDir().violations(doc).length, 0, 'a matching name must pass'
    );
  });
  it('flags a name that differs from its parent directory', () => {
    const text = '---\nname: something-else\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('skills/code-review/SKILL.md', text).document();
    assert.strictEqual(
      new NameMatchesDir().violations(doc).length, 1, 'a mismatching name must be flagged'
    );
  });
  it('ignores a file that is not a skill', () => {
    const text = '---\nname: something-else\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('skills/code-review/CLAUDE.md', text).document();
    assert.strictEqual(
      new NameMatchesDir().violations(doc).length, 0, 'a non-skill file must escape the check'
    );
  });
});

describe('NameMatchesDir prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new NameMatchesDir().prompt(), '', 'the rule stays deterministic and out of the oracle'
    );
  });
});
