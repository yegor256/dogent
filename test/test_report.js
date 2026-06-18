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
  it('appends the analysis duration when handed one', () => {
    const report = new Report('dogent', [], 340);
    assert.ok(
      /0 problems found in 340ms/u.test(report.text()),
      'the text must close with a friendly elapsed time'
    );
  });
  it('omits the duration when none is given', () => {
    const report = new Report('dogent', []);
    assert.ok(
      !/ in /u.test(report.text()),
      'a report with no timing must not invent an elapsed clause'
    );
  });
  it('invites a false-positive report when problems exist', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.ok(
      /github\.com\/yegor256\/dogent\/issues/u.test(report.text()),
      'the text must point at the issue tracker when problems exist'
    );
  });
  it('stays silent about false positives when clean', () => {
    const report = new Report('dogent', []);
    assert.ok(
      !/issues/u.test(report.text()),
      'a clean report must not nag about false positives'
    );
  });
});
