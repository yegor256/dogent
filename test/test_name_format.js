/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const path = require('node:path');
const Markdown = require('../src/markdown');
const NameFormat = require('../src/rules/name-format');

describe('NameFormat', () => {
  it('flags a skill whose name is not kebab-case', () => {
    const text = '---\nname: Review-Code\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 1, 'a non-kebab name must be flagged'
    );
  });
  it('accepts a skill whose name is kebab-case', () => {
    const text = '---\nname: code-review\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('SKILL.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 0, 'a kebab-case name must pass'
    );
  });
  it('ignores a name on a file that is not a skill', () => {
    const text = '---\nname: Review-Code\ndescription: Review code\n---\n# Doors\nShut gate';
    const doc = new Markdown('CLAUDE.md', text).document();
    assert.strictEqual(
      new NameFormat().violations(doc).length, 0, 'a non-skill file must escape the check'
    );
  });
});


describe('NameFormat paths', () => {
  const uris = [
    path.join('skills', 'review', 'SKILL.md'),
    path.resolve('skills', 'review', 'SKILL.md')
  ];
  if (process.platform === 'win32') {
    uris.push(String.raw`C:\skills\review\SKILL.md`, String.raw`\\server\skills\review\SKILL.md`);
  } else {
    uris.push('skills/review\ncode/SKILL.md');
  }
  for (const uri of uris) {
    it(`preserves the diagnostic for ${JSON.stringify(uri)}`, () => {
      const text = '---\ndescription: Review code\nname: Review-Code\n---\n';
      const doc = new Markdown(uri, text).document();
      assert.deepStrictEqual(new NameFormat().violations(doc).map((item) => item.sarif()), [{
        ruleId: 'name-format',
        level: 'error',
        message: {text: 'name "Review-Code" must be kebab-case'},
        locations: [{physicalLocation: {
          artifactLocation: {uri},
          region: {startLine: 3, startColumn: 1}
        }}]
      }]);
    });
    it(`ignores a missing name in ${JSON.stringify(uri)}`, () => {
      const doc = new Markdown(uri, '---\ndescription: Review code\n---\n').document();
      assert.deepStrictEqual(new NameFormat().violations(doc), []);
    });
    it(`ignores missing frontmatter in ${JSON.stringify(uri)}`, () => {
      const doc = new Markdown(uri, '# Review\nReview code').document();
      assert.deepStrictEqual(new NameFormat().violations(doc), []);
    });
  }
  for (const file of ['CLAUDE.md', 'skill.md', 'SKILL.md.bak']) {
    it(`ignores ${file} in a native directory path`, () => {
      const uri = path.join('skills', 'review\ncode', file);
      const doc = new Markdown(uri, '---\nname: Review-Code\n---\n').document();
      assert.deepStrictEqual(new NameFormat().violations(doc), []);
    });
  }
});
