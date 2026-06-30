/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Oracle = require('../src/oracle');
const Usage = require('../src/usage');

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

/**
 * A stub that answers each call with the next reply in a fixed list, so
 * a test can hand the oracle a different sample per run and check how it
 * reconciles them.
 * @param {Array} replies One canned reply per successive call
 * @return {Object} A chat whose answer cycles through the replies
 */
const scripted = (replies) => {
  let calls = 0;
  return {
    answer() {
      const content = replies[calls];
      calls += 1;
      return Promise.resolve({content, usage: new Usage('m', 9, 4)});
    }
  };
};

const flagged = (line) => JSON.stringify({
  results: [
    {
      ruleId: 'inconsistency',
      level: 'warning',
      message: {text: `line ${line} clashes with line 9`},
      confidence: 0.95,
      locations: [
        {
          physicalLocation: {
            artifactLocation: {uri: 'x.md'},
            region: {startLine: line, startColumn: 1}
          }
        }
      ]
    }
  ]
});

describe('Oracle', () => {
  it('turns the AI reply into rendered violations', async () => {
    const reply = JSON.stringify({
      results: [
        {
          ruleId: 'command',
          level: 'warning',
          message: {text: 'sounds like a question'},
          confidence: 0.95,
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
      (await new Oracle(new FakeChat(reply)).violations(doc)).found[0].text(),
      'x.md:2:1 warning [command]: sounds like a question (confidence 95%)',
      'the oracle must turn the AI reply into violations'
    );
  });
  it('sums the token usage across every sample', async () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    assert.strictEqual(
      (await new Oracle(new FakeChat('{"results":[]}')).violations(doc)).usage.sent,
      27,
      'the oracle must sum the token usage across its three samples'
    );
  });
  it('logs the full prompt it sends to the chat', async () => {
    const notes = [];
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    await new Oracle(new FakeChat('{"results":[]}'), {debug(line) {
      notes.push(line);
    }}).violations(doc);
    assert.ok(
      notes.join('').includes('Shut the gate'),
      'the oracle must log the prompt body it sends to the AI'
    );
  });
});

describe('Oracle prompt log', () => {
  it('announces the prompt size before sending it', async () => {
    const notes = [];
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    await new Oracle(new FakeChat('{"results":[]}'), {debug(line) {
      notes.push(line);
    }}).violations(doc);
    assert.match(
      notes.join(''),
      /Sending this prompt \([0-9]+ lines, [0-9]+ symbols\) to OpenAI [0-9]+ times:/u,
      'the oracle must announce the prompt size before it sends it'
    );
  });
  it('indents every logged prompt line by two spaces', async () => {
    const notes = [];
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    await new Oracle(new FakeChat('{"results":[]}'), {debug(line) {
      notes.push(line);
    }}).violations(doc);
    assert.ok(
      notes.join('').includes('\n  You are reviewing'),
      'the oracle must indent every logged prompt line by two spaces'
    );
  });
});

describe('Oracle self-consistency', () => {
  it('keeps a contradiction that recurs in a majority of samples', async () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    const chat = scripted([flagged(3), flagged(3), '{"results":[]}']);
    assert.strictEqual(
      (await new Oracle(chat).violations(doc)).found.length,
      1,
      'a finding present in two of three samples must survive'
    );
  });
  it('drops a contradiction that appears in only a minority of samples', async () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate').document();
    const chat = scripted([flagged(3), '{"results":[]}', '{"results":[]}']);
    assert.strictEqual(
      (await new Oracle(chat).violations(doc)).found.length,
      0,
      'a finding present in only one of three samples must be discarded'
    );
  });
});
