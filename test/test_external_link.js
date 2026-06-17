/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const ExternalLink = require('../src/rules/external-link');

describe('ExternalLink', () => {
  it('flags a bare https URL', () => {
    const doc = new Markdown('x.md', '# H\nRead the guide at https://example.com/x.').document();
    assert.strictEqual(
      new ExternalLink().violations(doc).length,
      1,
      'a bare https URL must be flagged'
    );
  });
  it('flags a bare http URL', () => {
    const doc = new Markdown('x.md', '# H\nRead the guide at http://example.com/x.').document();
    assert.strictEqual(
      new ExternalLink().violations(doc).length,
      1,
      'a bare http URL must be flagged'
    );
  });
  it('accepts a URL inside inline code', () => {
    const doc = new Markdown('x.md', '# H\nSee `https://x.com` for the spec.').document();
    assert.strictEqual(
      new ExternalLink().violations(doc).length,
      0,
      'a URL inside inline code must not be flagged'
    );
  });
  it('accepts a URL inside a fenced block', () => {
    const doc = new Markdown('x.md', '# H\n```\nhttps://x.com\n```').document();
    assert.strictEqual(
      new ExternalLink().violations(doc).length,
      0,
      'a URL inside a fenced snippet must not be flagged'
    );
  });
  it('accepts a plain command with no URL', () => {
    const doc = new Markdown('x.md', '# H\nRun the build script.').document();
    assert.strictEqual(
      new ExternalLink().violations(doc).length,
      0,
      'a command carrying no URL must pass'
    );
  });
});

describe('ExternalLink prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new ExternalLink().prompt().includes('external-link'),
      'the prompt must mention the rule id'
    );
  });
});
