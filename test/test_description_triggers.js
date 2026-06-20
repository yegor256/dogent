/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const DescriptionTriggers = require('../src/rules/description-triggers');
const Violation = require('../src/violation');
const Region = require('../src/region');

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

describe('DescriptionTriggers suppress', () => {
  const flag = (line) => new Violation(
    'description-triggers',
    'warning',
    'Description is too generic',
    new Region('SKILL.md', line, 1)
  );
  it('vetoes an oracle flag on a description that quotes a phrase', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: file-bug\ndescription: Use this when the user hands over a finding, saying "file this bug" or "open an issue"\n---\n# Doors\nShut gate'
    ).document();
    assert.strictEqual(
      new DescriptionTriggers().suppress(flag(3), doc),
      true,
      'a description holding "when" and a quoted phrase must be vetoed'
    );
  });
  it('keeps an oracle flag on a description with no quoted phrase', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: review\ndescription: Use this skill when reviewing pull requests for bugs\n---\n# Doors\nShut gate'
    ).document();
    assert.strictEqual(
      new DescriptionTriggers().suppress(flag(3), doc),
      false,
      'a description that quotes nothing must keep its flag'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: file-bug\ndescription: Use this when the user says "file this bug"\n---\n# Doors\nShut gate'
    ).document();
    const other = new Violation(
      'command', 'warning', 'sounds like a question', new Region('SKILL.md', 3, 1)
    );
    assert.strictEqual(
      new DescriptionTriggers().suppress(other, doc),
      false,
      'only a description-triggers flag may be vetoed by this guard'
    );
  });
});

describe('DescriptionTriggers prompt', () => {
  it('names the rule id', () => {
    assert.ok(
      new DescriptionTriggers().prompt().includes('description-triggers'),
      'the prompt must carry the rule id'
    );
  });
  it('directs the oracle to weigh activation situations', () => {
    assert.ok(
      new DescriptionTriggers().prompt().includes('situations'),
      'the prompt must hand activation judgement to the oracle'
    );
  });
  it('spares a description that quotes an example phrase', () => {
    assert.ok(
      new DescriptionTriggers().prompt().includes('quotes an example user phrase'),
      'the prompt must leave a quoted-phrase description alone'
    );
  });
});
