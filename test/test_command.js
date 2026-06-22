/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Command = require('../src/rules/command');

describe('Command', () => {
  it('flags a line that opens with a pronoun', () => {
    const doc = new Markdown('x.md', '# Doors\nYou should shut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length,
      1,
      'a line opening with a pronoun must be flagged'
    );
  });
  it('accepts an imperative line', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length,
      0,
      'an imperative line must pass'
    );
  });
});
