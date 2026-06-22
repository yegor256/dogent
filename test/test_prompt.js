/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Command = require('../src/rules/command');
const Prompt = require('../src/prompt');

const text = (body = '# Doors\nShut gate') => {
  const doc = new Markdown('x.md', body).document();
  return new Prompt([new Command()], doc).text();
};

describe('Prompt', () => {
  it('carries the manifesto body verbatim', () => {
    assert.ok(
      text('# Doors\nShut the gate').includes('Shut the gate'),
      'the prompt must carry the manifesto body for the oracle to read'
    );
  });
  it('carries a fragment from every rule it is given', () => {
    assert.ok(
      text().includes('command'),
      'the prompt must include the command rule fragment'
    );
  });
  it('opens its sections with first-level Markdown headers', () => {
    assert.ok(
      text().includes('# Checks'),
      'the prompt must split its parts into first-level Markdown sections'
    );
  });
  it('wraps the manifesto body in a fenced Markdown snippet', () => {
    assert.ok(
      text('# Doors\nShut the gate').includes('```\n1: # Doors'),
      'the prompt must fence the numbered manifesto inside a Markdown snippet'
    );
  });
  it('lists each rule as a bullet', () => {
    assert.ok(
      text().includes('- **command**'),
      'the prompt must list every rule name as a bullet item'
    );
  });
  it('bolds each rule name with double asterisks', () => {
    assert.ok(
      text().includes('**command**:'),
      'the prompt must wrap every rule name in bold double-asterisks'
    );
  });
  it('teaches the oracle the terse imperative house style', () => {
    assert.ok(
      text().includes('imperative verb'),
      'the prompt must explain that each line is a compressed imperative command'
    );
  });
  it('teaches the oracle how sections own their lines', () => {
    assert.ok(
      text().includes('belongs to that section'),
      'the prompt must explain that a line belongs to the heading above it'
    );
  });
  it('subjects clashes to the same confidence gate as every check', () => {
    assert.ok(
      !text().includes('clash is never a false alarm'),
      'the prompt must not exempt clashes from the shared confidence gate'
    );
  });
  it('omits the phantom line a trailing newline would add', () => {
    assert.ok(
      !text('# Doors\nShut gate\n').includes('3: '),
      'a trailing newline must not be numbered as a non-existent line'
    );
  });
});

describe('Prompt reply shape', () => {
  it('asks the oracle to score each warning with a confidence', () => {
    assert.ok(
      text().includes('confidence'),
      'the prompt must ask the oracle to report a confidence per warning'
    );
  });
  it('grants the oracle permission to report nothing', () => {
    assert.ok(
      text().includes('report nothing'),
      'the prompt must tell the oracle an empty reply is the expected outcome'
    );
  });
  it('forbids the oracle from echoing the offending line', () => {
    assert.ok(
      text().includes('echo the offending line'),
      'the prompt must keep the warning free of the verbatim line'
    );
  });
  it('asks the oracle to explain why the line breaks the check', () => {
    assert.ok(
      text().includes('explain'),
      'the prompt must ask the oracle to explain the fault, not just name it'
    );
  });
  it('asks the oracle to suggest how to fix the fault', () => {
    assert.ok(
      text().includes('suggest how to fix'),
      'the prompt must ask the oracle to suggest a concrete fix'
    );
  });
});
