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
  it('renders each violation inside its body', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 7, 1))]
    );
    assert.ok(
      report.body().includes('a.md:7:1'),
      'the body must render the location of every violation it holds'
    );
  });
  it('keeps the problem count out of its body', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.ok(
      !/problems found/u.test(report.body()),
      'the body must carry violations alone, never the summary line'
    );
  });
});

describe('Report summary', () => {
  it('summarises the total inside its summary', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.ok(
      /1 problems found/u.test(report.summary()),
      'the summary must report the number of problems found'
    );
  });
  it('appends the analysis duration when handed one', () => {
    const report = new Report('dogent', [], 340);
    assert.ok(
      /0 problems found in 340ms/u.test(report.summary()),
      'the summary must close with a friendly elapsed time'
    );
  });
  it('omits the duration when none is given', () => {
    const report = new Report('dogent', []);
    assert.ok(
      !/ in /u.test(report.summary()),
      'a summary with no timing must not invent an elapsed clause'
    );
  });
  it('invites a false-positive report when problems exist', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.ok(
      /github\.com\/yegor256\/dogent\/issues/u.test(report.summary()),
      'the summary must point at the issue tracker when problems exist'
    );
  });
  it('stays silent about false positives when clean', () => {
    const report = new Report('dogent', []);
    assert.ok(
      !/issues/u.test(report.summary()),
      'a clean summary must not nag about false positives'
    );
  });
});

describe('Report hints', () => {
  it('renders the hint of a rule that reported a violation', () => {
    const report = new Report(
      'dogent', [new Violation('r', 'error', 'm', new Region('a.md', 1, 1))]
    );
    assert.strictEqual(
      report.hints([{id: 'r', hint: () => 'fix it like so'}]),
      '[r]: fix it like so',
      'the hints must name each firing rule and carry its fixing paragraph'
    );
  });
  it('names each firing rule only once', () => {
    const report = new Report('dogent', [
      new Violation('r', 'error', 'm', new Region('a.md', 1, 1)),
      new Violation('r', 'error', 'm', new Region('a.md', 2, 1))
    ]);
    assert.strictEqual(
      report.hints([{id: 'r', hint: () => 'fix it'}]),
      '[r]: fix it',
      'a rule that fires twice must contribute only one hint'
    );
  });
  it('emits nothing when no violation fired', () => {
    const report = new Report('dogent', []);
    assert.strictEqual(
      report.hints([{id: 'r', hint: () => 'fix it'}]),
      '',
      'a report with no violations must render no hints'
    );
  });
});
