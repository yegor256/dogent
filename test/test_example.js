/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Example = require('../src/rules/example');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Example', () => {
  it('flags a SKILL.md that only describes', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Example().violations(doc).length,
      1,
      'a skill with no example must be flagged'
    );
  });
  it('accepts a SKILL.md carrying a code block', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n```bash\ndogent SKILL.md\n```';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Example().violations(doc).length,
      0,
      'a skill that shows a snippet must pass'
    );
  });
  it('accepts a SKILL.md carrying an example heading', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n## Examples\nInput maps to output.';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new Example().violations(doc).length,
      0,
      'a skill with an example section must pass'
    );
  });
  it('ignores a file that is not a skill', () => {
    const doc = new Markdown('CLAUDE.md', '# Steps\nShut gate.').document();
    assert.strictEqual(
      new Example().violations(doc).length,
      0,
      'a non-skill file must escape the example rule'
    );
  });
});

describe('Example suppress', () => {
  it('vetoes an oracle flag when both a snippet and an example heading exist', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n## Example\nInput maps to output.\n\n```\nName: x\n```';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('example', 'warning', 'the example does not clearly demonstrate the declared output format for all fields', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Example().suppress(flag, doc),
      true,
      'an oracle flag must be vetoed once a snippet and an example heading both stand'
    );
  });
  it('keeps an oracle flag when only a snippet exists', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n```\nName: x\n```';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('example', 'warning', 'the example does not clearly demonstrate the declared output format for all fields', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Example().suppress(flag, doc),
      false,
      'an oracle flag must survive when no example heading stands beside the snippet'
    );
  });
  it('keeps an oracle flag when only an example heading exists', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n## Example\nInput maps to output.';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('example', 'warning', 'the example does not clearly demonstrate the declared output format for all fields', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Example().suppress(flag, doc),
      false,
      'an oracle flag must survive when no snippet stands beside the heading'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const text = '---\nname: review\ndescription: Use when reviewing code\n---\n# Steps\nShut gate.\n\n## Example\nInput maps to output.\n\n```\nName: x\n```';
    const doc = new Markdown('SKILL.md', text).document();
    const flag = new Violation('format', 'warning', 'SKILL.md generates output but never declares its format', new Region('SKILL.md', 1, 1));
    assert.strictEqual(
      new Example().suppress(flag, doc),
      false,
      'a flag raised by another rule must not be touched'
    );
  });
});

describe('Example prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Example().prompt().includes('example'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to weigh a worked example', () => {
    assert.ok(
      new Example().prompt().includes('worked example'),
      'the prompt must hand example judgement to the oracle'
    );
  });
});
