/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Atomic = require('../src/rules/atomic');

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
