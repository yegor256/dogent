/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const ToolClarity = require('../src/rules/tool-clarity');

describe('ToolClarity', () => {
  it('flags running the script', () => {
    const doc = new Markdown('x.md', '# H\nRun the script.').document();
    assert.strictEqual(
      new ToolClarity().violations(doc).length,
      1,
      'a bare "run the script" must be flagged'
    );
  });
  it('flags using the tool', () => {
    const doc = new Markdown('x.md', '# H\nUse the tool.').document();
    assert.strictEqual(
      new ToolClarity().violations(doc).length,
      1,
      'a bare "use the tool" must be flagged'
    );
  });
  it('ignores a backticked command', () => {
    const doc = new Markdown('x.md', '# H\nRun `npm test`.').document();
    assert.strictEqual(
      new ToolClarity().violations(doc).length,
      0,
      'a backticked command must not be flagged'
    );
  });
  it('accepts a proper name', () => {
    const doc = new Markdown('x.md', '# H\nRun dogent.').document();
    assert.strictEqual(
      new ToolClarity().violations(doc).length,
      0,
      'a proper tool name must pass'
    );
  });
});
