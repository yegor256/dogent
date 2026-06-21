/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Simple = require('../src/rules/simple');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Simple', () => {
  it('flags a tangled multi-clause line', () => {
    const doc = new Markdown('x.md', '# H\nIf the input is valid, and no error occurred, then emit the result, unless verbose.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'a tangled multi-clause line must be flagged');
  });
  it('accepts a short imperative line', () => {
    const doc = new Markdown('x.md', '# H\nValidate the input.').document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'a short imperative line must pass'
    );
  });
  it('accepts one conjunction with one comma', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nRun standalone by default, call AI only when token exists.'
    ).document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'one conjunction with one comma must stay below threshold'
    );
  });
  it('accepts a comma-separated list carrying no conjunction', () => {
    const doc = new Markdown('x.md', '# H\nDo not run build, tests, linters, or static analysis.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a plain list must not count as multi-clause');
  });
  it('accepts a coordinated list inside a single when clause', () => {
    const doc = new Markdown('x.md', '# H\nStop when text is missing, empty, or only whitespace.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a list inside one clause must not count as tangled');
  });
  it('exposes its id in the prompt', () => {
    assert.ok(
      new Simple().prompt().includes('simple'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to weigh clause depth', () => {
    assert.ok(
      new Simple().prompt().includes('clause depth'),
      'the prompt must hand true clause-depth analysis to the oracle'
    );
  });
});

describe('Simple suppress', () => {
  it('vetoes an oracle flag on a line with no comma and no conjunction', () => {
    const doc = new Markdown('x.md', '# H\nWrite like human.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'a line without comma or conjunction cannot be tangled'
    );
  });
  it('keeps an oracle flag on a line carrying a conjunction', () => {
    const doc = new Markdown('x.md', '# H\nEmit the result when input is valid.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a conjunction leaves room for genuine tangle'
    );
  });
  it('keeps an oracle flag on a line carrying a comma', () => {
    const doc = new Markdown('x.md', '# H\nEmit the result, then halt.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a comma leaves room for genuine tangle'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# H\nWrite like human.').document();
    const flag = new Violation('command', 'warning', 'reads as a statement', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'only a simple flag may be vetoed by the simple guard'
    );
  });
});
