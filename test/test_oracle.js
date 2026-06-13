/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Oracle = require('../src/oracle');

/**
 * FakeChat.
 *
 * A stub standing in for the OpenAI endpoint, answering every prompt
 * with one canned reply so the oracle can be tested without a network.
 */
class FakeChat {
  constructor(reply) {
    this.reply = reply;
  }
  answer() {
    return Promise.resolve(this.reply);
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
      (await new Oracle([], new FakeChat(reply)).violations(doc))[0].text(),
      'x.md:2:1 warning [command]: sounds like a question',
      'the oracle must turn the AI reply into violations'
    );
  });
});
