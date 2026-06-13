/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Sources = require('../src/sources');

describe('Sources', () => {
  it('keeps a plain file path untouched', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([file]).files(), [file], 'a file path must pass through unchanged'
    );
  });
  it('expands a directory into its default manifesto files', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Kitchen\nSharpen knife');
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([dir]).files(),
      [path.join(dir, 'AGENTS.md'), path.join(dir, 'CLAUDE.md')],
      'a directory must expand into the default manifestos it holds'
    );
  });
  it('skips default manifestos that the directory lacks', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    fs.writeFileSync(path.join(dir, 'SKILL.md'), '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([dir]).files(),
      [path.join(dir, 'SKILL.md')],
      'a directory must yield only the manifestos that exist'
    );
  });
  it('finds manifestos nested inside subdirectories', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const sub = path.join(dir, 'skills', 'kitchen');
    fs.mkdirSync(sub, {recursive: true});
    fs.writeFileSync(path.join(sub, 'SKILL.md'), '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([dir]).files(),
      [path.join(sub, 'SKILL.md')],
      'a directory must be scanned recursively into its subfolders'
    );
  });
  it('ignores manifestos buried inside node_modules', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const sub = path.join(dir, 'node_modules', 'dep');
    fs.mkdirSync(sub, {recursive: true});
    fs.writeFileSync(path.join(sub, 'SKILL.md'), '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([dir]).files(), [], 'node_modules must stay out of the scan'
    );
  });
});
