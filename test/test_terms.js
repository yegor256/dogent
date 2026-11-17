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
  it('accepts "bot" beside "agent" as domain-distinct nouns', () => {
    const doc = new Markdown('x.md', '# H\nThe agent posts a reaction.\nThe Telegram bot sends it.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      '"bot" names the sender, not the actor, so it must not pair with "agent"'
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
describe('Terms plural drift', () => {
  it('flags plural synonyms of one concept', () => {
    const doc = new Markdown('x.md', '# H\nScan the directories.\nList the folders.').document();
    const found = new Terms().violations(doc);
    assert.strictEqual(
      found.length,
      1,
      'mixing "directories" and "folders" must be flagged like the singulars'
    );
    assert.strictEqual(
      found[0].text(),
      'x.md:3:1 warning [terms]: concept named two ways ("directory"/"folder"), pick one term',
      'plural drift must report canonical singular names at the second term'
    );
  });
  it('flags a singular term drifting into a plural rival', () => {
    const doc = new Markdown('x.md', '# H\nScan the directory.\nList the folders.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      1,
      '"directory" beside "folders" is still synonym drift'
    );
  });
  it('treats singular and plural of one term as the same name', () => {
    const doc = new Markdown('x.md', '# H\nScan the directory.\nList the directories.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      'grammatical number must not turn one term into two rivals'
    );
  });
  it('accepts one consistent plural term', () => {
    const doc = new Markdown('x.md', '# H\nScan the directories.\nList the directories.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      'a single consistent plural term must pass'
    );
  });
  it('ignores plural synonyms inside code spans', () => {
    const doc = new Markdown('x.md', '# H\nScan the `directories`.\nList the `folders`.').document();
    assert.strictEqual(
      new Terms().violations(doc).length,
      0,
      'mixed plural terms only inside code spans must not be flagged'
    );
  });
});
