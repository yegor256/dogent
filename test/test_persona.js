/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Persona = require('../src/rules/persona');

describe('Persona', () => {
  it('flags a you-are role line', () => {
    const doc = new Markdown('x.md', '# H\nYou are a senior software engineer.').document();
    assert.strictEqual(
      new Persona().violations(doc).length,
      1,
      'a "you are a" persona line must be flagged'
    );
  });
  it('flags an act-as role line', () => {
    const doc = new Markdown('x.md', '# H\nAct as an expert reviewer.').document();
    assert.strictEqual(
      new Persona().violations(doc).length,
      1,
      'an "act as" persona line must be flagged'
    );
  });
  it('flags an as-a-role preface', () => {
    const doc = new Markdown('x.md', '# H\nAs a reviewer, scan diff.').document();
    assert.strictEqual(
      new Persona().violations(doc).length,
      1,
      'an "as a role," preface must be flagged'
    );
  });
  it('accepts a plain imperative', () => {
    const doc = new Markdown('x.md', '# H\nReview diff before merge.').document();
    assert.strictEqual(
      new Persona().violations(doc).length,
      0,
      'a plain imperative must pass'
    );
  });
  it('accepts a mid-line as-a phrase', () => {
    const doc = new Markdown('x.md', '# H\nModel input as a list.').document();
    assert.strictEqual(
      new Persona().violations(doc).length,
      0,
      'a non-head "as a" phrase must not be flagged'
    );
  });
});

describe('Persona prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Persona().prompt().includes('persona'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to catch indirect persona framing', () => {
    assert.ok(
      new Persona().prompt().includes('indirect persona'),
      'the prompt must hand indirect framing to the oracle'
    );
  });
});
