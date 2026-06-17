/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const ExampleFormat = require('../src/rules/example-format');

describe('ExampleFormat', () => {
  it('leaves the example-versus-format match to the oracle', () => {
    const doc = new Markdown('x.md', '# Out\nShow an example.\nReturn JSON.').document();
    assert.strictEqual(
      new ExampleFormat().violations(doc).length,
      0,
      'the standalone check must find nothing and defer to the oracle'
    );
  });
  it('exposes the declared format to the oracle', () => {
    assert.ok(
      new ExampleFormat().prompt().includes('format'),
      'the rule must ask the oracle to weigh the declared format'
    );
  });
  it('exposes the shown example to the oracle', () => {
    assert.ok(
      new ExampleFormat().prompt().includes('example'),
      'the rule must ask the oracle to weigh the shown example'
    );
  });
});
