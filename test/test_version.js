/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const version = require('../src/version');

describe('version', () => {
  it('matches the semantic version shape', () => {
    assert.ok(
      /[0-9]+\.[0-9]+\.[0-9]/u.test(version),
      'the version must read as a dotted number triple'
    );
  });
});
