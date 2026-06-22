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

const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));

const write = (dir, name, body) => fs.writeFileSync(path.join(dir, name), body);

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

describe('DeadImport chains', () => {
  it('flags an import chain that loops back', () => {
    const dir = temp();
    write(dir, 'a.md', 'Load @CLAUDE.md.');
    const doc = document(dir, '# Gates\nLoad @a.md.');
    assert.ok(
      new DeadImport().violations(doc).some((bad) => bad.message.includes('circular')),
      'a chain looping back to the manifesto must be flagged'
    );
  });
  it('flags a chain nested deeper than five levels', () => {
    const dir = temp();
    [1, 2, 3, 4, 5].forEach((level) => write(dir, `l${level}.md`, `Load @l${level + 1}.md.`));
    write(dir, 'l6.md', 'Sharpen knife.');
    const doc = document(dir, '# Gates\nLoad @l1.md.');
    assert.ok(
      new DeadImport().violations(doc).some((bad) => bad.message.includes('deeper')),
      'an import chain nesting past five levels must be flagged'
    );
  });
  it('accepts a chain nested exactly five levels', () => {
    const dir = temp();
    [1, 2, 3, 4].forEach((level) => write(dir, `l${level}.md`, `Load @l${level + 1}.md.`));
    write(dir, 'l5.md', 'Sharpen knife.');
    const doc = document(dir, '# Gates\nLoad @l1.md.');
    const count = new DeadImport().violations(doc).length;
    assert.strictEqual(count, 0, 'a chain within five levels must pass');
  });
});
