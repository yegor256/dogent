/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Concise = require('../src/rules/concise');

describe('Concise', () => {
  it('flags a file past the line budget', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.\nThree.').document();
    assert.strictEqual(
      new Concise(2).violations(doc).length,
      1,
      'a file longer than the budget must be flagged'
    );
  });
  it('accepts a file within the line budget', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.').document();
    assert.strictEqual(
      new Concise(200).violations(doc).length,
      0,
      'a short file must pass'
    );
  });
  it('ignores a lone trailing newline', () => {
    const doc = new Markdown('x.md', '# H\nOne.\nTwo.\n').document();
    assert.strictEqual(
      new Concise(3).violations(doc).length,
      0,
      'a trailing blank line must not count toward the budget'
    );
  });
});

describe('Concise physical lines', () => {
  for (const [name, max, input, expected] of [
    ['empty file', 0, '', []],
    ['unterminated line', 1, 'Do work.', []],
    ['single terminator', 1, 'Do work.\n', []],
    ['blank second line', 1, 'Do work.\n\n', [
      'x.md:2:1 warning [concise]: file too long (2 lines), split detail into referenced files'
    ]],
    ['whitespace second line', 1, 'Do work.\n \n', [
      'x.md:2:1 warning [concise]: file too long (2 lines), split detail into referenced files'
    ]],
    ['blank-only line', 0, '\n', [
      'x.md:1:1 warning [concise]: file too long (1 lines), split detail into referenced files'
    ]],
    ['trailing blanks at the default budget', 200, `Do work.\n${'\n'.repeat(200)}`, [
      'x.md:201:1 warning [concise]: file too long (201 lines), split detail into referenced files'
    ]],
    ['full count beyond the budget', 1, 'Do work.\nDo more.\n\n', [
      'x.md:2:1 warning [concise]: file too long (3 lines), split detail into referenced files'
    ]]
  ]) {
    it(`counts physical lines for ${name}`, () => {
      const doc = new Markdown('x.md', input).document();
      assert.deepStrictEqual(
        new Concise(max).violations(doc).map((violation) => violation.text()),
        expected,
        'only the final split sentinel must be excluded from the line count'
      );
    });
  }
});
