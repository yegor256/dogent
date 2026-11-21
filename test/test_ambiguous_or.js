/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const AmbiguousOr = require('../src/rules/ambiguous-or');

describe('AmbiguousOr', () => {
  it('flags an and/or alternative', () => {
    const doc = new Markdown('x.md', '# H\nLint and/or format.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      1,
      'an "and/or" alternative must be flagged'
    );
  });
  it('flags a slashed alternative', () => {
    const doc = new Markdown('x.md', '# H\nUse tabs/spaces.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      1,
      'a slashed word alternative must be flagged'
    );
  });
});

describe('AmbiguousOr path boundaries', () => {
  [
    'docs/and/or/guide.md',
    'docs/and/or.txt',
    'docs/alpha/beta/guide.md',
    'and/or/guide.md',
    'and/or.txt',
    '/and/or',
    './and/or',
    'docs/AND/OR.txt'
  ].forEach((path) => {
    it(`accepts the unambiguous path ${path}`, () => {
      const doc = new Markdown('x.md', `# H\nRead ${path}.`).document();
      assert.deepStrictEqual(new AmbiguousOr().violations(doc), []);
    });
  });
  [
    ['Lint and/or format.', 6, 'and/or'],
    ['Choose (and/or).', 9, 'and/or'],
    ['Choose AND/OR.', 8, 'AND/OR'],
    ['Use tabs/spaces.', 5, 'tabs/spaces']
  ].forEach(([text, column, choice]) => {
    it(`preserves the diagnostic for ${text}`, () => {
      const doc = new Markdown('x.md', `# H\n${text}`).document();
      assert.deepStrictEqual(
        new AmbiguousOr().violations(doc).map((violation) => violation.text()),
        [`x.md:2:${column} warning [ambiguous-or]: ambiguous "${choice}", state exactly which option applies`]
      );
    });
  });
  it('flags a choice following an unambiguous path', () => {
    const doc = new Markdown('x.md', '# H\nRead docs/and/or.txt and/or format.').document();
    assert.deepStrictEqual(
      new AmbiguousOr().violations(doc).map((violation) => violation.text()),
      ['x.md:2:22 warning [ambiguous-or]: ambiguous "and/or", state exactly which option applies']
    );
  });
});

describe('AmbiguousOr masked text', () => {
  it('accepts a backticked path', () => {
    const doc = new Markdown('x.md', '# H\nEdit the `src/app` folder.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      0,
      'a backticked path must not be flagged'
    );
  });
  it('accepts a plain command', () => {
    const doc = new Markdown('x.md', '# H\nFormat the whole file.').document();
    assert.strictEqual(
      new AmbiguousOr().violations(doc).length,
      0,
      'a plain command must pass'
    );
  });
});

describe('AmbiguousOr choices', () => {
  [
    ['Reply y/n.', 7, 'y/n'],
    ['- Reply Y/N.', 9, 'Y/N'],
    ['Choose a/all.', 8, 'a/all'],
    ['Choose all/a.', 8, 'all/a'],
    ['Reply (y/n).', 8, 'y/n'],
    ['Reply yes/no.', 7, 'yes/no']
  ].forEach(([text, column, choice]) => {
    it(`reports the choice and position in ${text}`, () => {
      const doc = new Markdown('x.md', `# H\n${text}`).document();
      assert.deepStrictEqual(
        new AmbiguousOr().violations(doc).map((violation) => violation.text()),
        [`x.md:2:${column} warning [ambiguous-or]: ambiguous "${choice}", state exactly which option applies`],
        'a slashed alternative must retain its spelling and source position'
      );
    });
  });
});

describe('AmbiguousOr exclusions', () => {
  [
    'Reply `y/n`.',
    'Reply `Y/N`.',
    'Read docs/y/n.',
    'Read ./y/n.',
    'Read /y/n.',
    'Read y/n/file.',
    'Read y/n.txt.',
    'Read file.y/n.',
    'Read y1/n.',
    'Read y/n1.'
  ].forEach((text) => {
    it(`accepts the excluded token in ${text}`, () => {
      const doc = new Markdown('x.md', `# H\n${text}`).document();
      assert.deepStrictEqual(
        new AmbiguousOr().violations(doc),
        [],
        'inline code, paths, dotted tokens and non-letter operands must stay excluded'
      );
    });
  });
  it('preserves positions after masked code and paths', () => {
    const doc = new Markdown('x.md', '# H\n`y/n` y/n.txt y/n; a/all.').document();
    assert.deepStrictEqual(
      new AmbiguousOr().violations(doc).map((violation) => violation.text()),
      [
        'x.md:2:15 warning [ambiguous-or]: ambiguous "y/n", state exactly which option applies',
        'x.md:2:20 warning [ambiguous-or]: ambiguous "a/all", state exactly which option applies'
      ],
      'excluded tokens must not shift later diagnostic positions'
    );
  });
});
