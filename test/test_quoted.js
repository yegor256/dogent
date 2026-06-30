/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const quoted = require('../src/quoted');

describe('quoted', () => {
  it('marks a word after a report-that clause as quoted', () => {
    assert.strictEqual(
      quoted('Argue that many repositories beat one.', 11),
      true,
      'a word after "argue that" sits in a described position'
    );
  });
  it('leaves a word before any report clause unquoted', () => {
    assert.strictEqual(
      quoted('Handle errors properly here.', 14),
      false,
      'a word with no governing report verb is a real instruction'
    );
  });
});
