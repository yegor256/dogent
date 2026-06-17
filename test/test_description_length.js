/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DescriptionLength = require('../src/rules/description-length');

describe('DescriptionLength', () => {
  it('flags an oversized description', () => {
    const doc = new Markdown('skills/g/SKILL.md', `---\nname: g\ndescription: ${'x'.repeat(1100)}\n---\n# H\nDo it.`).document();
    assert.strictEqual(
      new DescriptionLength().violations(doc).length,
      1,
      'a description beyond the ceiling must be flagged'
    );
  });
  it('flags an empty stub', () => {
    const doc = new Markdown('skills/g/SKILL.md', '---\nname: g\ndescription:\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionLength().violations(doc).length,
      1,
      'an empty description must be flagged'
    );
  });
  it('accepts a concise description', () => {
    const doc = new Markdown('skills/g/SKILL.md', '---\nname: g\ndescription: Extracts tables. Use when asked.\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionLength().violations(doc).length,
      0,
      'a concise description must pass'
    );
  });
  it('ignores a file that is not a skill', () => {
    const doc = new Markdown('x.md', `---\nname: g\ndescription: ${'x'.repeat(1100)}\n---\n# H\nDo it.`).document();
    assert.strictEqual(
      new DescriptionLength().violations(doc).length,
      0,
      'a non-skill file must escape the description size check'
    );
  });
});

describe('DescriptionLength prompt', () => {
  it('stays empty for a deterministic rule', () => {
    assert.strictEqual(
      new DescriptionLength().prompt(),
      '',
      'a standalone rule must hand nothing to the oracle'
    );
  });
});
