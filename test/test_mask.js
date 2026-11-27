/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const mask = require('../src/mask');

describe('mask', () => {
  it('blanks out an inline-code span', () => {
    assert.strictEqual(
      mask('Cut `very` now.'),
      'Cut        now.',
      'an inline-code span must become equal-length spaces'
    );
  });
  it('keeps every column offset intact', () => {
    assert.strictEqual(
      mask('Drop `x`.').length,
      'Drop `x`.'.length,
      'the masked line must keep its original length'
    );
  });
  it('leaves prose without backticks untouched', () => {
    assert.strictEqual(
      mask('Run the build.'),
      'Run the build.',
      'a line free of inline code must pass through unchanged'
    );
  });
  it('masks a whole double-backtick span', () => {
    assert.strictEqual(
      mask('Print ``please `x` kindly``.'),
      `Print ${' '.repeat(21)}.`,
      'a double-backtick span must hide its inner words entirely'
    );
  });
  it('masks a double-backtick span with no inner code', () => {
    assert.strictEqual(
      mask('Print ``please``.'),
      `Print ${' '.repeat(10)}.`,
      'a double-backtick span must become one masked block'
    );
  });
  it('leaves unmatched backtick runs untouched', () => {
    assert.strictEqual(
      mask('One ` tick here.'),
      'One ` tick here.',
      'a backtick run without an equal-length partner must stay visible'
    );
  });
});
