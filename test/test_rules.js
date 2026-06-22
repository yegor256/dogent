/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const rules = require('../src/rules');

describe('rules', () => {
  it('hands every assembled rule a violations method', () => {
    assert.ok(
      rules().every((rule) => typeof rule.violations === 'function'),
      'every assembled rule must offer a violations method'
    );
  });
});
