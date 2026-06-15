/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Atomic = require('../src/rules/atomic');

describe('Atomic', () => {
  it('flags two welded sentences on one line', () => {
    const doc = new Markdown('x.md', '# H\nParse the file and emit fragments.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      1,
      'a line with two welded verb phrases must be flagged'
    );
  });
  it('flags a semicolon-joined pair of instructions', () => {
    const doc = new Markdown('x.md', '# H\nRead line by line; never use a grammar.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      1,
      'a line joined by a semicolon must be flagged'
    );
  });
  it('accepts a single atomic instruction', () => {
    const doc = new Markdown('x.md', '# H\nParse the file.').document();
    assert.strictEqual(
      new Atomic().violations(doc).length,
      0,
      'a line with one instruction must pass'
    );
  });
  it('accepts one verb with coordinated objects', () => {
    const doc = new Markdown('x.md', '# H\nStrip emotions and rhetorical flourish.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a single verb coordinating two objects must pass');
  });
  it('accepts an Oxford-comma list closed by and', () => {
    const doc = new Markdown('x.md', '# H\nAvoid AI cadence, boilerplate openings, and buzzword strings.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a list closed by an Oxford comma must pass');
  });
  it('accepts an -ate adjective after and as a coordinated object', () => {
    const doc = new Markdown('x.md', '# H\nInclude file path and approximate line number.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'an -ate adjective after and must not weld');
  });
  it('exposes the id through the prompt', () => {
    assert.ok(
      new Atomic().prompt().includes('atomic'),
      'the prompt must name the rule id'
    );
  });
  it('directs the oracle to count clauses without welding tokens', () => {
    assert.ok(
      new Atomic().prompt().includes('clauses'),
      'the prompt must hand subtle clause-counting to the oracle'
    );
  });
});
