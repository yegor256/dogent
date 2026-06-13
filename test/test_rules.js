/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const rules = require('../src/rules');

describe('rules', () => {
  it('hands every assembled rule a prompt fragment for the oracle', () => {
    assert.ok(
      rules().every((rule) => typeof rule.prompt === 'function'),
      'every rule consulted by the oracle must offer a prompt fragment'
    );
  });
});
