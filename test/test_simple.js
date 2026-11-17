/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Simple = require('../src/rules/simple');

describe('Simple', () => {
  it('flags a tangled multi-clause line', () => {
    const doc = new Markdown('x.md', '# H\nIf the input is valid, and no error occurred, then emit the result, unless verbose.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'a tangled multi-clause line must be flagged');
  });
  it('accepts a short imperative line', () => {
    const doc = new Markdown('x.md', '# H\nValidate the input.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a short imperative line must pass');
  });
  it('accepts one conjunction with one comma', () => {
    const doc = new Markdown('x.md', '# H\nRun standalone by default, call AI only when token exists.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'one conjunction with one comma must stay below threshold');
  });
  it('accepts a comma-separated list carrying no conjunction', () => {
    const doc = new Markdown('x.md', '# H\nDo not run build, tests, linters, or static analysis.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a plain list must not count as multi-clause');
  });
  it('accepts a coordinated list inside a single when clause', () => {
    const doc = new Markdown('x.md', '# H\nStop when text is missing, empty, or only whitespace.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a list inside one clause must not count as tangled');
  });
  it('flags nested clauses even when a later clause starts with and', () => {
    const doc = new Markdown('x.md', '# H\nIf validation fails, stop, unless retry is enabled, and then retry.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'a trailing and clause must not swallow the clause commas');
  });
  it('flags nested clauses that end without a coordination', () => {
    const doc = new Markdown('x.md', '# H\nIf validation fails, stop, unless retry is enabled, then retry.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'nested if and unless clauses must be flagged');
  });
  it('accepts a coordinated list joined by and', () => {
    const doc = new Markdown('x.md', '# H\nDo not run build, tests, and linters in one pass.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a plain list joined by and must not count as multi-clause');
  });
  it('accepts an inline code span carrying its own grammar', () => {
    const doc = new Markdown('x.md', '# H\nPrint `if, x, y`.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a code span must not read as prose grammar');
  });
  it('flags a tangled line that also carries an inline code span', () => {
    const doc = new Markdown('x.md', '# H\nIf `x, y` fails, stop, unless retry is enabled, then log.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'a code span must not hide the clause commas around it');
  });
});
