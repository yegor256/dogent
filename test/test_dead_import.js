/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const Markdown = require('../src/markdown');
const DeadImport = require('../src/rules/dead-import');

const document = (dir, body) => {
  const file = path.join(dir, 'CLAUDE.md');
  fs.writeFileSync(file, body);
  return new Markdown(file, fs.readFileSync(file, 'utf8')).document();
};

describe('DeadImport', () => {
  it('flags a missing import target', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const doc = document(dir, '# Gates\nLoad @parts/missing.md.');
    const violations = new DeadImport().violations(doc);
    assert.strictEqual(
      violations.length, 1, 'a missing @-import must be reported'
    );
  });
  it('accepts an import that resolves beside the manifesto', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const part = path.join(dir, 'parts');
    fs.mkdirSync(part);
    fs.writeFileSync(path.join(part, 'extra.md'), 'Sharpen knife.');
    const doc = document(dir, '# Gates\nLoad @parts/extra.md.');
    const violations = new DeadImport().violations(doc);
    assert.strictEqual(
      violations.length, 0, 'an existing @-import must pass'
    );
  });
  it('resolves imports from the manifesto directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    const skill = path.join(dir, 'skills');
    const part = path.join(skill, 'parts');
    fs.mkdirSync(skill);
    fs.mkdirSync(part);
    fs.writeFileSync(path.join(part, 'extra.md'), 'Sharpen knife.');
    const doc = document(skill, '# Gates\nLoad @parts/extra.md.');
    const violations = new DeadImport().violations(doc);
    assert.strictEqual(
      violations.length, 0, 'the import path must be relative to the manifesto file'
    );
  });
});
