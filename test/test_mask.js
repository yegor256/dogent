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
});
