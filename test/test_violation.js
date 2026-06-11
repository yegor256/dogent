/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Violation', function () {
  it('carries its rule id into the SARIF result', function () {
    const sarif = new Violation(
      'line-length', 'error', 'too wide', new Region('x.md', 5, 81)
    ).sarif();
    assert.strictEqual(sarif.ruleId, 'line-length', 'the SARIF result must carry the rule id');
  });
  it('renders a human line with the location ahead of the message', function () {
    const text = new Violation('grouped', 'error', 'loose line', new Region('a.md', 7, 1)).text();
    assert.strictEqual(
      text, 'a.md:7:1 error grouped loose line',
      'the human line must place the location before the message'
    );
  });
});
