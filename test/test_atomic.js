/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Atomic = require('../src/rules/atomic');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Atomic', () => {
  it('flags two sentences welded by a mid-line terminator', () => {
    const doc = new Markdown('x.md', '# H\nParse the file. Emit fragments.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 1, 'a terminator sitting mid-line must be flagged');
  });
  it('flags a semicolon-joined pair of instructions', () => {
    const doc = new Markdown('x.md', '# H\nRead line by line; never use a grammar.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 1, 'a line joined by a semicolon must be flagged');
  });
  it('accepts a single atomic instruction', () => {
    const doc = new Markdown('x.md', '# H\nParse the file.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a line with one instruction must pass');
  });
  it('accepts an Oxford-comma list closed by and', () => {
    const doc = new Markdown('x.md', '# H\nAvoid AI cadence, boilerplate openings, and buzzword strings.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a list closed by an Oxford comma must pass');
  });
  it('accepts a coordinated noun object trailing and', () => {
    const doc = new Markdown('x.md', '# H\nSkip fenced code and inline code.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a plain noun after and must not weld');
  });
  it('accepts a coordinated gerund object trailing and', () => {
    const doc = new Markdown('x.md', '# H\nPreserve the UTF-8 encoding and line endings.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a gerund object after and must not weld');
  });
  it('accepts a temporal adverb trailing then', () => {
    const doc = new Markdown('x.md', '# H\nThe author then confirms meaning was preserved.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'a temporal then must not weld');
  });
  it('leaves an and-joined verb pair for the oracle', () => {
    const doc = new Markdown('x.md', '# H\nList supporting claims and note the evidence.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'the standalone checker must defer and-welded verbs to the oracle');
  });
});

describe('Atomic prompt', () => {
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
  it('tells the oracle an Oxford-comma object list stays one instruction', () => {
    assert.ok(
      new Atomic().prompt().includes('Oxford-comma list'),
      'the prompt must spare a leading imperative trailed by an Oxford-comma object list'
    );
  });
  it('warns the oracle that a list item may embed its own verb', () => {
    assert.ok(
      new Atomic().prompt().includes('embeds its own verb'),
      'the prompt must clear a list item that embeds a finite verb'
    );
  });
  it('shows the oracle the coordinated-object example', () => {
    assert.ok(
      new Atomic().prompt().includes('why it is wrong'),
      'the prompt must carry the coordinated-object example'
    );
  });
});

describe('Atomic suppress', () => {
  it('vetoes an oracle flag on a lone imperative with no welding token', () => {
    const doc = new Markdown('x.md', '# Rules\nOpen with substance over boilerplate.').document();
    const flag = new Violation('atomic', 'warning', 'line carries more than one instruction', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Atomic().suppress(flag, doc),
      true,
      'an oracle flag on a line with no welding token must be vetoed'
    );
  });
  it('vetoes an oracle flag on an imperative closed by a prepositional phrase', () => {
    const doc = new Markdown('x.md', '# Rules\nAsk only for owner\'s attention.').document();
    const flag = new Violation('atomic', 'warning', 'line carries more than one instruction', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Atomic().suppress(flag, doc),
      true,
      'a trailing prepositional phrase must not count as a second instruction'
    );
  });
  it('keeps an oracle flag on a line welded by and', () => {
    const doc = new Markdown('x.md', '# Rules\nList supporting claims and note the evidence.').document();
    const flag = new Violation('atomic', 'warning', 'line carries more than one instruction', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Atomic().suppress(flag, doc),
      false,
      'an oracle flag on an and-welded line must survive'
    );
  });
  it('keeps an oracle flag on a line welded by a semicolon', () => {
    const doc = new Markdown('x.md', '# Rules\nRead line by line; never use a grammar.').document();
    const flag = new Violation('atomic', 'warning', 'line carries more than one instruction', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Atomic().suppress(flag, doc),
      false,
      'an oracle flag on a semicolon-welded line must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# Rules\nOpen with substance over boilerplate.').document();
    const flag = new Violation('command', 'warning', 'reads as a description', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Atomic().suppress(flag, doc),
      false,
      'only an atomic flag may be vetoed by the atomic guard'
    );
  });
});

describe('Atomic abbreviations', () => {
  it('accepts an inline example introduced by e.g.', () => {
    const doc = new Markdown('x.md', '# H\nOpen paragraph with salutation, e.g. `Boss,`.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'an e.g. abbreviation must not read as a terminator');
  });
  it('accepts an inline clarification introduced by i.e.', () => {
    const doc = new Markdown('x.md', '# H\nName the rule, i.e. the lowercase id.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'an i.e. abbreviation must not read as a terminator');
  });
  it('accepts a trailing list closed by etc.', () => {
    const doc = new Markdown('x.md', '# H\nStrip articles, noise, etc. from the line.').document();
    assert.strictEqual(new Atomic().violations(doc).length, 0, 'an etc. abbreviation must not read as a terminator');
  });
});
