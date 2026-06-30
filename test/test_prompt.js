/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Prompt = require('../src/prompt');

const text = (body = '# Doors\nShut gate') => {
  const doc = new Markdown('x.md', body).document();
  return new Prompt(doc).text();
};

describe('Prompt', () => {
  it('carries the manifesto body verbatim', () => {
    assert.ok(
      text('# Doors\nShut the gate').includes('Shut the gate'),
      'the prompt must carry the manifesto body for the oracle to read'
    );
  });
  it('opens its sections with first-level Markdown headers', () => {
    assert.ok(
      text().includes('# Manifesto'),
      'the prompt must split its parts into first-level Markdown sections'
    );
  });
  it('wraps the manifesto body in a fenced Markdown snippet', () => {
    assert.ok(
      text('# Doors\nShut the gate').includes('```\n1: # Doors'),
      'the prompt must fence the numbered manifesto inside a Markdown snippet'
    );
  });
  it('asks the oracle to hunt for inconsistencies', () => {
    assert.ok(
      text().includes('contradicts itself'),
      'the prompt must ask the oracle to find where the file contradicts itself'
    );
  });
  it('hands the oracle no Checks section', () => {
    assert.ok(
      !text().includes('# Checks'),
      'the prompt must not hand the oracle a Checks section to apply'
    );
  });
  it('bullets no rule for the oracle to apply', () => {
    assert.ok(
      !text().includes('- **'),
      'the prompt must not list any rule as a bullet for the oracle'
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
  it('asks the oracle to explain how the lines clash', () => {
    assert.ok(
      text().includes('explain'),
      'the prompt must ask the oracle to explain the clash, not just name it'
    );
  });
});

describe('Prompt reasoning caveats', () => {
  it('tells the oracle to honor explicit branch words', () => {
    assert.ok(
      text().includes('Honor explicit branch words'),
      'the prompt must tell the oracle that "otherwise" marks branches, not a clash'
    );
  });
  it('tells the oracle that sequencing is compatible', () => {
    assert.ok(
      text().includes('A-then-B sequencing as compatible'),
      'the prompt must tell the oracle a filter-then-record pipeline is no conflict'
    );
  });
  it('tells the oracle that try-then-fallback is compatible', () => {
    assert.ok(
      text().includes('try-then-fallback as compatible'),
      'the prompt must tell the oracle a "when you cannot X" fallback is no clash'
    );
  });
  it('tells the oracle to look for a resolving line first', () => {
    assert.ok(
      text().includes('resolves the tension'),
      'the prompt must tell the oracle to scan for a resolving line before flagging'
    );
  });
  it('tells the oracle a draft-only result is no send conflict', () => {
    assert.ok(
      text().includes('draft-only result is the finished deliverable'),
      'the prompt must tell the oracle an intentionally unsent draft is no contradiction'
    );
  });
  it('tells the oracle that fixing errors is not rewording', () => {
    assert.ok(
      text().includes('fix typos or transcription errors'),
      'the prompt must tell the oracle that repairing errors preserves wording'
    );
  });
});
