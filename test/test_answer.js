/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Answer = require('../src/answer');

describe('Answer', () => {
  it('renders one SARIF result as a human violation line', () => {
    const raw = JSON.stringify({
      results: [
        {
          ruleId: 'command',
          level: 'warning',
          message: {text: 'sounds like a question'},
          locations: [{physicalLocation: {artifactLocation: {uri: 'x.md'}, region: {startLine: 4, startColumn: 1}}}]
        }
      ]
    });
    assert.strictEqual(
      new Answer(raw).violations()[0].text(),
      'x.md:4:1 warning [command]: sounds like a question',
      'a SARIF result must map back to a rendered violation'
    );
  });
  it('skips a malformed result instead of crashing the run', () => {
    const raw = JSON.stringify({
      results: [
        {ruleId: 'command', message: {}, locations: []},
        {
          ruleId: 'command',
          level: 'warning',
          message: {text: 'real one'},
          locations: [{physicalLocation: {artifactLocation: {uri: 'x.md'}, region: {startLine: 3, startColumn: 1}}}]
        }
      ]
    });
    assert.strictEqual(
      new Answer(raw).violations().length,
      1,
      'a result missing its location or message must be ignored'
    );
  });
});
