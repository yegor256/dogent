/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DescriptionVoice = require('../src/rules/description-voice');

describe('DescriptionVoice', () => {
  it('flags a first-person description', () => {
    const doc = new Markdown('skills/g/SKILL.md', '---\nname: g\ndescription: I extract tables.\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionVoice().violations(doc).length,
      1,
      'a first-person description must be flagged'
    );
  });
  it('flags a second-person description', () => {
    const doc = new Markdown('skills/g/SKILL.md', '---\nname: g\ndescription: You can extract tables.\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionVoice().violations(doc).length,
      1,
      'a second-person description must be flagged'
    );
  });
  it('accepts a third-person description with a trigger', () => {
    const doc = new Markdown('skills/g/SKILL.md', '---\nname: g\ndescription: Extracts tables. Use when the user asks.\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionVoice().violations(doc).length,
      0,
      'a third-person description must pass'
    );
  });
  it('ignores a file that is not a skill', () => {
    const doc = new Markdown('CLAUDE.md', '---\nname: g\ndescription: I extract tables.\n---\n# H\nDo it.').document();
    assert.strictEqual(
      new DescriptionVoice().violations(doc).length,
      0,
      'a non-skill file must escape the voice check'
    );
  });
});

describe('DescriptionVoice prompt', () => {
  it('names the voice it demands', () => {
    assert.ok(
      new DescriptionVoice().prompt().includes('third'),
      'the prompt must demand a third-person statement'
    );
  });
});
