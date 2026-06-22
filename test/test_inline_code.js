/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const InlineCode = require('../src/rules/inline-code');

describe('InlineCode flags', () => {
  it('flags a bare filename with a known extension', () => {
    const doc = new Markdown('x.md', '# H\nEdit the package.json file.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      1,
      'a bare filename must be flagged'
    );
  });
  it('flags a bare path with a slash', () => {
    const doc = new Markdown('x.md', '# H\nOpen the src/app folder.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      1,
      'a bare slashed path must be flagged'
    );
  });
  it('flags a bare command-line flag', () => {
    const doc = new Markdown('x.md', '# H\nPass the --offline switch.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      1,
      'a bare flag must be flagged'
    );
  });
  it('flags a bare shell command with an argument', () => {
    const doc = new Markdown('x.md', '# H\nThen npm test runs.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      1,
      'a bare shell command and its argument must be flagged'
    );
  });
});

describe('InlineCode accepts', () => {
  it('accepts an already backticked literal', () => {
    const doc = new Markdown('x.md', '# H\nEdit the `package.json` file.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      0,
      'a backticked literal must pass'
    );
  });
  it('accepts plain prose with no literal token', () => {
    const doc = new Markdown('x.md', '# H\nTag release before shipping.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      0,
      'a plain command must pass'
    );
  });
  it('leaves an @-import to the dead-import rule', () => {
    const doc = new Markdown('x.md', '# H\nRead @docs/setup.md first.').document();
    assert.strictEqual(
      new InlineCode().violations(doc).length,
      0,
      'an @-import must not be flagged by inline-code'
    );
  });
});
