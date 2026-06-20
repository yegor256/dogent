/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DescriptionVoice = require('../src/rules/description-voice');
const Violation = require('../src/violation');
const Region = require('../src/region');

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

const flag = (line) => new Violation(
  'description-voice',
  'warning',
  'description must be third person',
  new Region('skills/g/SKILL.md', line, 1)
);

describe('DescriptionVoice suppress', () => {
  it('vetoes an oracle flag on a body line', () => {
    const doc = new Markdown(
      'skills/g/SKILL.md', '---\nname: g\ndescription: Extracts tables. Use when the user asks.\n---\n# H\nVary sentence cadence.'
    ).document();
    assert.strictEqual(
      new DescriptionVoice().suppress(flag(6), doc),
      true,
      'a flag off the description row must be vetoed'
    );
  });
  it('vetoes an oracle flag on the description for an impersonal word', () => {
    const doc = new Markdown(
      'skills/g/SKILL.md', '---\nname: g\ndescription: Stops after one bug. Use when the user asks.\n---\n# H\nDo it.'
    ).document();
    assert.strictEqual(
      new DescriptionVoice().suppress(flag(3), doc),
      true,
      'a flag on a description holding no first- or second-person pronoun must be vetoed'
    );
  });
  it('keeps an oracle flag on a first-person description', () => {
    const doc = new Markdown(
      'skills/g/SKILL.md', '---\nname: g\ndescription: I extract tables.\n---\n# H\nDo it.'
    ).document();
    assert.strictEqual(
      new DescriptionVoice().suppress(flag(3), doc),
      false,
      'a description with a first-person pronoun must keep its flag'
    );
  });
});

describe('DescriptionVoice suppress guard', () => {
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown(
      'skills/g/SKILL.md', '---\nname: g\ndescription: I extract tables.\n---\n# H\nDo it.'
    ).document();
    const other = new Violation(
      'command', 'warning', 'sounds like a question', new Region('skills/g/SKILL.md', 6, 1)
    );
    assert.strictEqual(
      new DescriptionVoice().suppress(other, doc),
      false,
      'only a description-voice flag may be vetoed by this guard'
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
