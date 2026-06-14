/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Redundant = require('../src/rules/redundant');

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
});
