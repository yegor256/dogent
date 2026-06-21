/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Redundant = require('../src/rules/redundant');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Redundant', () => {
  it('flags a generic "Be helpful and accurate" line', () => {
    const doc = new Markdown('x.md', '# Voice\nBe helpful and accurate.').document();
    assert.strictEqual(
      new Redundant().violations(doc).length,
      1,
      'a line restating default model behavior must be flagged'
    );
  });
  it('flags "Write clean code" regardless of case', () => {
    const doc = new Markdown('x.md', '# Voice\nWRITE CLEAN CODE.').document();
    assert.strictEqual(
      new Redundant().violations(doc).length,
      1,
      'an uppercase generic instruction must still be flagged'
    );
  });
  it('flags a generic instruction inside a bullet list', () => {
    const doc = new Markdown('x.md', '# Voice\n- Follow best practices.').document();
    assert.strictEqual(
      new Redundant().violations(doc).length,
      1,
      'a generic instruction inside a bullet must be flagged'
    );
  });
  it('accepts a project-specific instruction', () => {
    const doc = new Markdown(
      'x.md', '# Voice\nWrap every prompt under eighty symbols.'
    ).document();
    assert.strictEqual(
      new Redundant().violations(doc).length,
      0,
      'a project-specific instruction must pass'
    );
  });
  it('exposes a prompt fragment for the oracle', () => {
    assert.ok(
      new Redundant().prompt().startsWith('redundant: '),
      'the rule must expose its prompt fragment for the oracle'
    );
  });
  it('directs the oracle to catch reworded paraphrases', () => {
    assert.ok(
      new Redundant().prompt().includes('paraphrases'),
      'the prompt must hand paraphrases beyond the blacklist to the oracle'
    );
  });
});

describe('Redundant suppress', () => {
  it('vetoes an oracle flag on the frontmatter description', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: g\ndescription: |\n  Reads tables, writes a report, and pings the owner in one comment.\n---\n# H\nDo it.'
    ).document();
    const flag = new Violation('redundant', 'error', 'generic instruction, model already knows this', new Region('SKILL.md', 4, 1));
    assert.strictEqual(
      new Redundant().suppress(flag, doc),
      true,
      'an oracle flag inside the frontmatter description must be vetoed'
    );
  });
  it('keeps an oracle flag on a body line', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: g\ndescription: Reads tables.\n---\n# H\nBe concise and clear.'
    ).document();
    const flag = new Violation('redundant', 'error', 'generic instruction, model already knows this', new Region('SKILL.md', 6, 1));
    assert.strictEqual(
      new Redundant().suppress(flag, doc),
      false,
      'an oracle flag on a body line must survive the frontmatter guard'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: g\ndescription: |\n  Reads tables, writes a report, and pings the owner.\n---\n# H\nDo it.'
    ).document();
    const flag = new Violation('command', 'warning', 'reads as a statement', new Region('SKILL.md', 4, 1));
    assert.strictEqual(
      new Redundant().suppress(flag, doc),
      false,
      'only a redundant flag may be vetoed by the redundant guard'
    );
  });
  it('tells the oracle to spare the frontmatter description', () => {
    assert.ok(
      new Redundant().prompt().includes('frontmatter'),
      'the prompt must exempt the frontmatter description from the redundancy check'
    );
  });
});
