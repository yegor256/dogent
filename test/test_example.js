/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Example = require('../src/rules/example');

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
