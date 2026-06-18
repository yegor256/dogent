/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const rules = require('../src/rules');

describe('hints', () => {
  it('offers a hint method on every assembled rule', () => {
    assert.ok(
      rules().every((rule) => typeof rule.hint === 'function'),
      'every rule must offer a hint method telling the agent how to fix it'
    );
  });
  it('returns a non-empty paragraph from every rule hint', () => {
    assert.ok(
      rules().every((rule) => rule.hint().trim().length > 0),
      'every rule hint must carry a non-empty fixing paragraph'
    );
  });
  it('keeps every rule hint on a single line', () => {
    assert.ok(
      rules().every((rule) => !rule.hint().includes('\n')),
      'every rule hint must stay one line, carrying no end-of-line characters'
    );
  });
});
