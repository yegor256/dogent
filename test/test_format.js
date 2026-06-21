/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Format = require('../src/rules/format');
const Violation = require('../src/violation');
const Region = require('../src/region');

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

describe('Format suppress', () => {
  it('vetoes an oracle flag when a format section is declared', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.\n\n## Format\nName, status, summary.';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('format', 'warning', 'Declare a machine-checkable output schema for the issue content', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Format().suppress(flag, doc),
      true,
      'an oracle flag must be vetoed once a format heading declares the shape'
    );
  });
  it('vetoes an oracle flag when a snippet shows the format', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.\n\n```\nName: x\n```';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('format', 'warning', 'Declare a machine-checkable output schema for the issue content', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Format().suppress(flag, doc),
      true,
      'an oracle flag must be vetoed once a snippet shows the shape'
    );
  });
  it('keeps an oracle flag when no format is declared', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('format', 'warning', 'Declare a machine-checkable output schema for the issue content', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Format().suppress(flag, doc),
      false,
      'an oracle flag on a skill that declares no format must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const text = '---\nname: report\ndescription: Use when reporting status\n---\n# Steps\nGenerate report from data.\n\n## Format\nName, status, summary.';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('example', 'warning', 'SKILL.md has no example', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Format().suppress(flag, doc),
      false,
      'a flag raised by another rule must not be touched'
    );
  });
});

describe('Format prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Format().prompt().includes('format'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to judge a machine-checkable format', () => {
    assert.ok(
      new Format().prompt().includes('machine-checkable'),
      'the prompt must hand format concreteness to the oracle'
    );
  });
  it('confines machine-checkability to structured data', () => {
    assert.ok(
      new Format().prompt().includes('structured data'),
      'the prompt must scope machine-checkability to structured output'
    );
  });
  it('accepts a prose deliverable pinned down as named fields', () => {
    assert.ok(
      /prose/iu.test(new Format().prompt()),
      'the prompt must let a declared prose format pass'
    );
  });
});
