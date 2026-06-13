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
});
