/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Answer = require('../src/answer');

const result = (extra) => ({
  ruleId: 'command',
  level: 'warning',
  message: {text: 'sounds like a question'},
  locations: [{physicalLocation: {artifactLocation: {uri: 'x.md'}, region: {startLine: 4, startColumn: 1}}}],
  ...extra
});

const reply = (...results) => JSON.stringify({results});

describe('Answer', () => {
  it('renders one SARIF result as a human violation line', () => {
    assert.strictEqual(
      new Answer(reply(result({}))).violations()[0].text(),
      'x.md:4:1 warning [command]: sounds like a question',
      'a SARIF result must map back to a rendered violation'
    );
  });
  it('skips a malformed result instead of crashing the run', () => {
    assert.strictEqual(
      new Answer(reply({ruleId: 'command', message: {}, locations: []}, result({}))).violations().length,
      1,
      'a result missing its location or message must be ignored'
    );
  });
  it('drops a warning the model is unsure about', () => {
    assert.strictEqual(
      new Answer(reply(result({confidence: 0.2}))).violations().length,
      0,
      'a low-confidence warning must be filtered out'
    );
  });
  it('drops a warning that misses the confidence floor', () => {
    assert.strictEqual(
      new Answer(reply(result({confidence: 0.7}))).violations().length,
      0,
      'a warning below the confidence floor must be filtered out'
    );
  });
  it('keeps a warning the model is sure about', () => {
    assert.strictEqual(
      new Answer(reply(result({confidence: 0.95}))).violations().length,
      1,
      'a high-confidence warning must be kept'
    );
  });
  it('shows the model confidence beside a warning it kept', () => {
    assert.strictEqual(
      new Answer(reply(result({confidence: 0.82}))).violations()[0].text(),
      'x.md:4:1 warning [command]: sounds like a question (confidence 82%)',
      'a kept warning must show the confidence the model reported'
    );
  });
});
