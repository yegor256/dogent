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
      text().includes('command:'),
      'the prompt must include the command rule fragment'
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
  it('orders the oracle to always report a clash', () => {
    assert.ok(
      text().includes('clash is never a false alarm'),
      'the prompt must mandate reporting duplicate or contradictory lines'
    );
  });
});
