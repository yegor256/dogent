/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Terms = require('../src/rules/terms');

describe('Terms', () => {
  it('flags two synonyms of one concept', () => {
    const doc = new Markdown('x.md', '# H\nScan the directory.\nList the folder.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      1,
      'mixing "directory" and "folder" must be flagged once'
    );
  });
  it('accepts one consistent term', () => {
    const doc = new Markdown('x.md', '# H\nScan the directory.\nList the directory.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      'a single consistent term must pass'
    );
  });
  it('ignores synonyms inside code spans', () => {
    const doc = new Markdown('x.md', '# H\nScan the `directory`.\nList the `folder`.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      'mixed terms only inside code spans must not be flagged'
    );
  });
});

describe('Terms prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Terms().prompt().includes('terms'),
      'the prompt must mention the rule id'
    );
  });
});
