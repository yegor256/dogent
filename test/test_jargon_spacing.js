/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Jargon = require('../src/rules/jargon');

describe('Jargon inline phrase spacing', () => {
  [' ', '  ', '\t', ' \t '].forEach((space) => {
    const forms = [
      `ICCQ stands${space}for`,
      `ICCQ is${space}short for`,
      `ICCQ is short${space}for`,
      `Read${space}ICCQ${space}as`
    ];
    forms.forEach((form) => {
      ['', '- '].forEach((prefix) => {
        it(`accepts ${JSON.stringify(prefix + form)}`, () => {
          const doc = new Markdown('x.md', `# H\nVisit ICCQ.\n${prefix}${form} the conference.`).document();
          assert.deepStrictEqual(new Jargon().violations(doc), []);
        });
      });
      ['.', ' `conference`.', ''].forEach((ending) => {
        it(`rejects missing content in ${JSON.stringify(form + ending)}`, () => {
          const doc = new Markdown('x.md', `# H\nVisit ICCQ.\n${form}${ending}`).document();
          assert.strictEqual(new Jargon().violations(doc).length, 1);
        });
      });
      ['`', '```\n'].forEach((fence) => {
        it(`ignores code definition ${JSON.stringify(fence + form)}`, () => {
          const doc = new Markdown('x.md', `# H\nVisit ICCQ.\n${fence}${form} the conference.${fence}`).document();
          assert.strictEqual(new Jargon().violations(doc).length, 1);
        });
      });
    });
  });
  ['ICCQ standsfor', 'ICCQ isshort for', 'ICCQ is shortfor', 'read ICCQ as', 'ICCQ means', 'ICCQ stands\nfor', 'ICCQ is\nshort for', 'ICCQ is short\nfor'].forEach((form) => {
    it(`preserves grammar for ${form}`, () => {
      const doc = new Markdown('x.md', `# H\n${form} the conference.`).document();
      assert.strictEqual(new Jargon().violations(doc).length, 1);
    });
  });
});
