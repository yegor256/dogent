/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Report = require('../src/report');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Report', () => {
  it('counts every violation it holds', () => {
    const report = new Report('dogent', [
      new Violation('r', 'error', 'm', new Region('a.md', 1, 1)),
      new Violation('r', 'error', 'm', new Region('a.md', 2, 1))
    ]);
    assert.strictEqual(report.count(), 2, 'the report must count every violation it holds');
  });
  it('summarises the total inside its text', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.ok(
      /1 problems found/u.test(report.text()),
      'the text must summarise the number of problems found'
    );
  });
});
