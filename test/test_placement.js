/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Placement = require('../src/rules/placement');

const buried = () => {
  const lines = ['# Title', 'Open the gate.'];
  for (let num = 0; num < 20; num += 1) {
    lines.push(`Sharpen tool ${num}.`);
  }
  lines.push('## Safety');
  lines.push('Wear the goggles.');
  for (let num = 0; num < 20; num += 1) {
    lines.push(`Polish tool ${num}.`);
  }
  return lines.join('\n');
};

describe('Placement flags', () => {
  it('flags a critical section buried in the middle third', () => {
    const doc = new Markdown('x.md', buried()).document();
    assert.strictEqual(
      new Placement().violations(doc).length,
      1,
      'a Safety section in the middle of the file must be flagged'
    );
  });
});

describe('Placement accepts', () => {
  it('accepts a critical section leading the file', () => {
    const lines = ['# Title', '## Mission', 'Ship value.'];
    for (let num = 0; num < 30; num += 1) {
      lines.push(`Polish tool ${num}.`);
    }
    const doc = new Markdown('x.md', lines.join('\n')).document();
    assert.strictEqual(
      new Placement().violations(doc).length,
      0,
      'a critical section near the top must pass'
    );
  });
  it('ignores a heading without a critical keyword', () => {
    const doc = new Markdown('x.md', '# Title\nA.\nB.\n## Steps\nC.\nD.\nE.').document();
    assert.strictEqual(
      new Placement().violations(doc).length,
      0,
      'a non-critical heading must never be flagged wherever it sits'
    );
  });
});
