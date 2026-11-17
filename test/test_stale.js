/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Stale = require('../src/rules/stale');

describe('Stale', () => {
  it('flags a latest reference', () => {
    const doc = new Markdown('x.md', '# H\nUse the latest Node release.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a "the latest" reference must be flagged'
    );
  });
  it('flags an as-of-today reference', () => {
    const doc = new Markdown('x.md', '# H\nAs of today, prefer X.').document();
    assert.ok(
      new Stale().violations(doc).length >= 1,
      'a time-bound reference must be flagged'
    );
  });
  it('flags a hardcoded version literal', () => {
    const doc = new Markdown('x.md', '# H\nPin Node to 18.17.0 here.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a version literal must be flagged'
    );
  });
  it('ignores a version inside a fenced code block', () => {
    const doc = new Markdown('x.md', '# H\n```\nnode 18.17.0\n```').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a version inside a fence must not be flagged'
    );
  });
  it('accepts a durable rule', () => {
    const doc = new Markdown('x.md', '# H\nPin Node to one major release.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a durable rule must pass'
    );
  });
});
describe('Stale decimals', () => {
  it('ignores a decimal quantity measured in units', () => {
    const doc = new Markdown('x.md', '# H\nWait for 1.5 seconds.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a decimal quantity in seconds is not a version pin'
    );
  });
  it('ignores a decimal quantity in a spec revision reference', () => {
    const doc = new Markdown('x.md', '# H\nVersion 1.5 of the spec says so.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a bare two-component decimal without pin context must not be flagged'
    );
  });
  it('ignores a bare decimal that reads as prose', () => {
    const doc = new Markdown('x.md', '# H\nWe keep compatibility with 2.0 in prose.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      0,
      'a bare two-component decimal in a sentence must not be flagged'
    );
  });
});
describe('Stale pins', () => {
  it('flags an install command pin with an at-sign', () => {
    const doc = new Markdown('x.md', '# H\nInstall foo@1.2.3 with npm.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'an @-prefixed pin in an install command must be flagged'
    );
  });
  it('flags a quoted version pin', () => {
    const doc = new Markdown('x.md', '# H\nSet "foo": "1.2.3" in the config.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a quoted semver pin must be flagged'
    );
  });
  it('flags a v-prefixed version', () => {
    const doc = new Markdown('x.md', '# H\nUpgrade to v2.0 before June.').document();
    assert.strictEqual(
      new Stale().violations(doc).length,
      1,
      'a v-prefixed version pin must be flagged'
    );
  });
});
