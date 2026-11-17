/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Jargon = require('../src/rules/jargon');

describe('Jargon parenthetical glosses', () => {
  ['', '   ', '\t', '...', '`role-based access control`'].forEach((gloss) => {
    [true, false].forEach((closed) => {
      const definition = `Use RBAC (${gloss}${closed ? ')' : ''}.`;
      it(`flags an absent gloss in ${JSON.stringify(definition)}`, () => {
        const doc = new Markdown('x.md', `# H\n${definition}\nUse RBAC again.`).document();
        assert.deepStrictEqual(
          new Jargon().violations(doc).map((violation) => violation.text()),
          ['x.md:2:5 warning [jargon]: acronym "RBAC" never expanded, define it on first use'],
          'an absent gloss must not license any mention or duplicate warnings'
        );
      });
    });
  });
  it('flags an unclosed gloss containing expansion text', () => {
    const doc = new Markdown('x.md', '# H\nUse RBAC (role-based access control.\nUse RBAC.').document();
    assert.deepStrictEqual(
      new Jargon().violations(doc).map((violation) => violation.text()),
      ['x.md:2:5 warning [jargon]: acronym "RBAC" never expanded, define it on first use'],
      'expansion text without a closing parenthesis must not define the acronym'
    );
  });
  [
    ['RBAC', 'Use RBAC (role-based access control).'],
    ['RBAC', 'Use RBAC (  role-based access control \t).'],
    ['RBAC', 'Use RBAC (контроль доступа).'],
    ['VPN', 'Use Virtual Private Network (VPN).'],
    ['AAA', 'Use the AAA pattern (Arrange-Act-Assert).']
  ].forEach(([acronym, definition]) => {
    it(`accepts the complete definition ${JSON.stringify(definition)}`, () => {
      const doc = new Markdown('x.md', `# H\nUse ${acronym}.\n${definition}\nUse ${acronym} again.`).document();
      assert.deepStrictEqual(
        new Jargon().violations(doc),
        [],
        'valid definitions must license earlier and later mentions'
      );
    });
  });
  ['Use RBAC (role-based access control).', 'Use the RBAC pattern (role-based access control).'].forEach((definition) => {
    it(`ignores a masked definition ${JSON.stringify(definition)}`, () => {
      const doc = new Markdown('x.md', `# H\n\`${definition}\`\nUse RBAC.`).document();
      assert.deepStrictEqual(
        new Jargon().violations(doc).map((violation) => violation.text()),
        ['x.md:3:5 warning [jargon]: acronym "RBAC" never expanded, define it on first use'],
        'code spans must not define acronyms'
      );
    });
  });
});
