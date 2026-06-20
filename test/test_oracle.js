/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Oracle = require('../src/oracle');
const Usage = require('../src/usage');
const Positive = require('../src/rules/positive');

/**
 * FakeChat.
 *
 * A stub standing in for the OpenAI endpoint, answering every prompt
 * with one canned reply so the oracle can be tested without a network.
 */
class FakeChat {
  constructor(content) {
    this.content = content;
  }
  answer() {
    return Promise.resolve({content: this.content, usage: new Usage('m', 9, 4)});
  }
}

describe('Oracle', () => {
  it('turns the AI reply into rendered violations', async () => {
    const reply = JSON.stringify({
      results: [
        {
          ruleId: 'command',
          level: 'warning',
          message: {text: 'sounds like a question'},
          locations: [
            {
              physicalLocation: {
                artifactLocation: {uri: 'x.md'},
                region: {startLine: 2, startColumn: 1}
              }
            }
          ]
        }
      ]
    });
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      (await new Oracle([], new FakeChat(reply)).violations(doc)).found[0].text(),
      'x.md:2:1 warning [command]: sounds like a question',
      'the oracle must turn the AI reply into violations'
    );
  });
  it('surfaces the token usage the chat reported', async () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      (await new Oracle([], new FakeChat('{"results":[]}')).violations(doc)).usage.sent,
      9,
      'the oracle must surface the token usage from the chat'
    );
  });
});

describe('Oracle refine', () => {
  it('lets a rule refine away a flag the model should never raise', async () => {
    const reply = JSON.stringify({
      results: [
        {
          ruleId: 'positive',
          level: 'warning',
          message: {text: 'Rewrite as a positive imperative'},
          locations: [
            {
              physicalLocation: {
                artifactLocation: {uri: 'x.md'},
                region: {startLine: 2, startColumn: 1}
              }
            }
          ]
        }
      ]
    });
    const doc = new Markdown('x.md', '# Errors\nThrow exception when wrong.').document();
    assert.strictEqual(
      (await new Oracle([new Positive()], new FakeChat(reply)).violations(doc)).found.length,
      0,
      'the oracle must drop a positive flag on an affirmative imperative'
    );
  });
});
