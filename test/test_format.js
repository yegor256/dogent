/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Format = require('../src/rules/format');

describe('Format', () => {
  it('flags a generating skill with no format', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Format().violations(doc).length,
      1,
      'a skill that generates without a format must be flagged'
    );
  });
  it('accepts a generating skill that shows a snippet', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.\n\n```json\n{"ok": true}\n```';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Format().violations(doc).length,
      0,
      'a declared output shape must let the skill pass'
    );
  });
  it('accepts a generating skill with a format section', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.\n\n## Output Format\nReturn one JSON object.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Format().violations(doc).length,
      0,
      'a format section must let the skill pass'
    );
  });
  it('accepts a skill that generates nothing', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nReview diff before merge.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Format().violations(doc).length,
      0,
      'a skill with no output verb must pass'
    );
  });
  it('ignores a file that is not a skill', () => {
    const doc = new Markdown('CLAUDE.md', '# Steps\nGenerate report from data.').document();
    assert.strictEqual(
      new Format().violations(doc).length,
      0,
      'a non-skill file must escape the format rule'
    );
  });
});
