/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const PseudoHeading = require('../src/rules/pseudo-heading');

describe('PseudoHeading', () => {
  it('flags a bold label ending in a colon', () => {
    const doc = new Markdown('x.md', '# H\n**Setup:**').document();
    assert.strictEqual(
      new PseudoHeading().violations(doc).length,
      1,
      'a wholly bold label must be flagged'
    );
  });
  it('flags an underscore-emphasized label', () => {
    const doc = new Markdown('x.md', '# H\n__Setup__').document();
    assert.strictEqual(
      new PseudoHeading().violations(doc).length,
      1,
      'a wholly underscore-bold label must be flagged'
    );
  });
});

describe('PseudoHeading acceptance', () => {
  it('accepts a real second-level heading', () => {
    const doc = new Markdown('x.md', '# H\n## Setup\nDo it.').document();
    assert.strictEqual(
      new PseudoHeading().violations(doc).length,
      0,
      'a real "##" heading must not be flagged'
    );
  });
  it('accepts a line with inline bold inside other words', () => {
    const doc = new Markdown('x.md', '# H\nUse **bold** sparingly.').document();
    assert.strictEqual(
      new PseudoHeading().violations(doc).length,
      0,
      'inline bold inside a sentence must not be flagged'
    );
  });
});
