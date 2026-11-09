/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const MetaReference = require('../src/rules/meta-reference');

describe('MetaReference', () => {
  it('flags an "as an AI" self-reference', () => {
    const doc = new Markdown('x.md', '# H\nAs an AI, you cannot browse.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      1,
      'an "as an AI" framing must be flagged'
    );
  });
  it('flags a "these instructions" self-reference', () => {
    const doc = new Markdown('x.md', '# H\nThese instructions are final.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      1,
      'a "these instructions" framing must be flagged'
    );
  });
  it('accepts a plain command', () => {
    const doc = new Markdown('x.md', '# H\nRun the tests.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a plain command must pass'
    );
  });
  it('ignores a self-reference inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`this prompt` is a token.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a self-reference inside inline code must not be flagged'
    );
  });
  it('stays disjoint from persona role assignment', () => {
    const doc = new Markdown('x.md', '# H\nAct as a reviewer.').document();
    assert.strictEqual(
      new MetaReference().violations(doc).length,
      0,
      'a persona role assignment must not be flagged by meta-reference'
    );
  });
});

describe('MetaReference phrase spacing', () => {
  const phrases = [
    'As an AI',
    'As a language model',
    'You are an AI',
    'You are a model',
    'This prompt',
    'These instructions',
    'This manifesto',
    'The system prompt'
  ];
  for (const phrase of phrases) {
    for (const separator of [' ', '  ', '\t', ' \t  ']) {
      const spelling = phrase.replace(/ /gu, separator);
      for (const prefix of ['', '- ', '  - ']) {
        it(`preserves ${JSON.stringify(spelling)} after ${JSON.stringify(prefix)}`, () => {
          const doc = new Markdown('x.md', `# H\n${prefix}${spelling} is final.`).document();
          assert.deepStrictEqual(
            new MetaReference().violations(doc).map((violation) => violation.text()),
            [`x.md:2:${prefix.length + 1} warning [meta-reference]: meta self-reference "${spelling}" issues no command, delete it`]
          );
        });
      }
      it(`ignores inline code containing ${JSON.stringify(spelling)}`, () => {
        const doc = new Markdown('x.md', `# H\nExample: \`${spelling}\`.`).document();
        assert.deepStrictEqual(new MetaReference().violations(doc), []);
      });
    }
  }
});

describe('MetaReference boundaries', () => {
  it('preserves multiple matches and columns after inline code', () => {
    const text = '`As  an AI` These\tinstructions; AS \t A  LANGUAGE\tMODEL.';
    const doc = new Markdown('x.md', `# H\n${text}`).document();
    assert.deepStrictEqual(
      new MetaReference().violations(doc).map((violation) => violation.text()),
      [
        'x.md:2:13 warning [meta-reference]: meta self-reference "These\tinstructions" issues no command, delete it',
        'x.md:2:33 warning [meta-reference]: meta self-reference "AS \t A  LANGUAGE\tMODEL" issues no command, delete it'
      ]
    );
  });
  for (const text of [
    'These `sample` instructions are final.',
    'As `sample` an AI, respond.',
    'This\nprompt is final.',
    'These\vinstructions are final.',
    'These\finstructions are final.',
    'Theseinstructions are final.',
    'These  instructionsExtra are final.',
    'NotThese  instructions are final.',
    '```text\nThese  instructions are final.\n```'
  ]) {
    it(`ignores unsupported framing ${JSON.stringify(text)}`, () => {
      const doc = new Markdown('x.md', `# H\n${text}`).document();
      assert.deepStrictEqual(new MetaReference().violations(doc), []);
    });
  }
});
