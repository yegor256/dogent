/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const Markdown = require('../src/markdown');
const Command = require('../src/rules/command');

describe('Command', function () {
  it('flags a line that opens with a pronoun', function () {
    const doc = new Markdown('x.md', '# Doors\nYou should shut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length, 1,
      'a line opening with a pronoun must be flagged'
    );
  });
  it('accepts an imperative line', function () {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length, 0,
      'an imperative line must pass'
    );
  });
});
