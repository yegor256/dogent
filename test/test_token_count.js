/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const TokenCount = require('../src/rules/token-count');

describe('TokenCount', () => {
  it('flags a file that overflows the token cap', () => {
    const doc = new Markdown('x.md', '# Doors\nShut the gate.').document();
    assert.strictEqual(
      new TokenCount(3).violations(doc).length,
      1,
      'a file beyond the token cap must be flagged'
    );
  });
  it('accepts a file within the token cap', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate.').document();
    assert.strictEqual(
      new TokenCount(50).violations(doc).length,
      0,
      'a file under the token cap must pass'
    );
  });
  it('counts the tokens hidden inside frontmatter', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: x\ndescription: alpha beta gamma delta\n---\n# H\nGo.'
    ).document();
    assert.strictEqual(
      new TokenCount(8).violations(doc).length,
      1,
      'frontmatter tokens must count toward the file cap'
    );
  });
});
