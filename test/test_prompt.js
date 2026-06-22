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
