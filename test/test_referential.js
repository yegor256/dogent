/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Referential = require('../src/rules/referential');

describe('Referential', () => {
  it('flags an it-subject line', () => {
    const doc = new Markdown('x.md', '# H\nIt must run before tests.').document();
    assert.strictEqual(
      new Referential().violations(doc).length,
      1,
      'a bare "it" subject must be flagged'
    );
  });
  it('flags a this-subject line', () => {
    const doc = new Markdown('x.md', '# H\nThis only applies on release.').document();
    assert.strictEqual(
      new Referential().violations(doc).length,
      1,
      'a bare "this" subject must be flagged'
    );
  });
  it('accepts a demonstrative determiner', () => {
    const doc = new Markdown('x.md', '# H\nThese rules stay final.').document();
    assert.strictEqual(
      new Referential().violations(doc).length,
      0,
      'a demonstrative naming a noun on the line must pass'
    );
  });
  it('accepts a named subject', () => {
    const doc = new Markdown('x.md', '# H\nThe linter runs before tests.').document();
    assert.strictEqual(
      new Referential().violations(doc).length,
      0,
      'a line naming its subject must pass'
    );
  });
  it('ignores a pronoun inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`it` names the iterator here.').document();
    assert.strictEqual(
      new Referential().violations(doc).length,
      0,
      'a pronoun inside inline code must not be flagged'
    );
  });
});

describe('Referential prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Referential().prompt().includes('referential'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to catch mid-line dangling references', () => {
    assert.ok(
      new Referential().prompt().includes('mid-line'),
      'the prompt must hand dangling references to the oracle'
    );
  });
});
