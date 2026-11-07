/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Violation', () => {
  it('carries its rule id into the SARIF result', () => {
    const sarif = new Violation(
      'line-length', 'error', 'too wide', new Region('x.md', 5, 81)
    ).sarif();
    assert.strictEqual(sarif.ruleId, 'line-length', 'the SARIF result must carry the rule id');
  });
  it('renders a human line with the location ahead of the message', () => {
    const text = new Violation('grouped', 'error', 'loose line', new Region('a.md', 7, 1)).text();
    assert.strictEqual(
      text,
      'a.md:7:1 error [grouped]: loose line',
      'the human line must place the location before the message'
    );
  });
  [
    ['placeholder', 'Use {0} literally.', 'Use {{0}} literally.'],
    ['empty braces', 'Use {} literally.', 'Use {{}} literally.'],
    ['doubled braces', 'Use {{0}} and {{}}.', 'Use {{{{0}}}} and {{{{}}}}.'],
    ['unmatched braces', 'Use } then {.', 'Use }} then {{.'],
    ['mixed text', 'Use {0} and {} literally.', 'Use {{0}} and {{}} literally.']
  ].forEach(([name, message, escaped]) => {
    it(`escapes literal ${name} in every SARIF serialization`, () => {
      const violation = new Violation('example', 'warning', message, new Region('a.md', 1, 1));
      assert.deepStrictEqual(
        [violation.sarif().message, violation.sarif().message],
        [{text: escaped}, {text: escaped}],
        'each SARIF message must double every literal brace exactly once'
      );
    });
    it(`preserves literal ${name} in human output after SARIF serialization`, () => {
      const violation = new Violation('example', 'warning', message, new Region('a.md', 1, 1));
      violation.sarif();
      assert.strictEqual(
        violation.text(),
        `a.md:1:1 warning [example]: ${message}`,
        'SARIF serialization must leave the human message unchanged'
      );
    });
  });
});
