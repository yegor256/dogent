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

describe('Sources error handling', () => {
  it('throws a clear error when a passed path does not exist', () => {
    const missing = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'absent.md');
    assert.throws(
      () => new Sources([missing]).files(),
      (error) => error.message === `No such file or directory: ${missing}`,
      'a missing path must surface as a clear, human-readable error'
    );
  });
});

describe('Sources deduplication', () => {
  it('scans an explicit manifesto and its parent only once', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const file = path.join(dir, 'SKILL.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([file, dir]).files(), [file], 'overlapping inputs must yield one file'
    );
  });
  it('scans overlapping directories only once', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const sub = path.join(dir, 'kitchen');
    fs.mkdirSync(sub);
    const file = path.join(sub, 'SKILL.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([dir, sub]).files(), [file], 'nested roots must yield one file'
    );
  });
  it('keeps the first spelling when relative and absolute paths overlap', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const file = path.join(dir, 'SKILL.md');
    const relative = path.relative(process.cwd(), file);
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([relative, file]).files(), [relative], 'the first spelling must survive'
    );
  });
  it('scans a symbolic link and its target only once', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const file = path.join(dir, 'SKILL.md');
    const alias = path.join(dir, 'alias.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    fs.symlinkSync(file, alias);
    assert.deepStrictEqual(
      new Sources([alias, file]).files(), [alias], 'a symlink must share its target identity'
    );
  });
  it('keeps different files in their discovery order', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const first = path.join(dir, 'SKILL.md');
    const second = path.join(dir, 'CLAUDE.md');
    fs.writeFileSync(first, '# Kitchen\nSharpen knife');
    fs.writeFileSync(second, '# Kitchen\nSharpen knife');
    assert.deepStrictEqual(
      new Sources([first, second, first]).files(), [first, second], 'keep unique files in order'
    );
  });
});
