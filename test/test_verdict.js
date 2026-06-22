/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Verdict = require('../src/verdict');
const Violation = require('../src/violation');
const Region = require('../src/region');

const verdict = (score) => new Verdict(
  new Violation('command', 'warning', 'reads as a question', new Region('a.md', 7, 1)),
  score
);

describe('Verdict', () => {
  it('shows the confidence as a percentage beside the warning', () => {
    assert.strictEqual(
      verdict(0.8).text(),
      'a.md:7:1 warning [command]: reads as a question (confidence 80%)',
      'the verdict must show the model confidence beside the warning'
    );
  });
  it('rounds the confidence to a whole percentage', () => {
    assert.ok(
      verdict(0.836).text().endsWith('(confidence 84%)'),
      'the verdict must round the confidence to a whole percentage'
    );
  });
  it('delegates its SARIF result to the wrapped violation', () => {
    assert.strictEqual(
      verdict(0.8).sarif().ruleId,
      'command',
      'the verdict must hand its SARIF result to the violation it wraps'
    );
  });
  it('exposes the rule id of the violation it wraps', () => {
    assert.strictEqual(
      verdict(0.8).rule,
      'command',
      'the verdict must expose the wrapped rule id for guards and reports'
    );
  });
});
