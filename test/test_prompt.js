/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Command = require('../src/rules/command');
const Prompt = require('../src/prompt');

describe('Prompt', () => {
  it('carries the manifesto body verbatim', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('Shut the gate'),
      'the prompt must carry the manifesto body for the oracle to read'
    );
  });
  it('carries a fragment from every rule it is given', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('command:'),
      'the prompt must include the command rule fragment'
    );
  });
  it('teaches the oracle the terse imperative house style', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('imperative verb'),
      'the prompt must explain that each line is a compressed imperative command'
    );
  });
  it('teaches the oracle how sections own their lines', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('belongs to that section'),
      'the prompt must explain that a line belongs to the heading above it'
    );
  });
  it('asks the oracle to score each warning with a confidence', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('confidence'),
      'the prompt must ask the oracle to report a confidence per warning'
    );
  });
  it('grants the oracle permission to report nothing', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.ok(
      new Prompt([new Command()], doc).text().includes('report nothing'),
      'the prompt must tell the oracle an empty reply is the expected outcome'
    );
  });
});
