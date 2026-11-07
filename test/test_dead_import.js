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

describe('DeadImport headings', () => {
  [1, 2, 3, 4, 5, 6].forEach((level) => {
    it(`flags a missing import in a level ${level} heading at its source position`, () => {
      const dir = temp();
      const doc = document(dir, `Intro.\n\n${'#'.repeat(level)} Load @absent.md.\n`);
      assert.deepStrictEqual(
        new DeadImport().violations(doc).map((bad) => bad.text()),
        [`${path.join(dir, 'CLAUDE.md')}:3:${level + 7} error [dead-import]: @-import target not found: absent.md`]
      );
    });
  });
  it('reports multiple heading imports in source order', () => {
    const dir = temp();
    const doc = document(dir, '# Load @first.md @second.md\n');
    assert.deepStrictEqual(
      new DeadImport().violations(doc).map((bad) => bad.text()),
      [
        `${path.join(dir, 'CLAUDE.md')}:1:8 error [dead-import]: @-import target not found: first.md`,
        `${path.join(dir, 'CLAUDE.md')}:1:18 error [dead-import]: @-import target not found: second.md`
      ]
    );
  });
  it('resolves heading imports relative to the manifesto', () => {
    const dir = temp();
    const nested = path.join(dir, 'nested');
    fs.mkdirSync(nested);
    write(dir, 'extra.md', 'Sharpen knife.');
    const doc = document(nested, '## Load @../extra.md\n');
    assert.deepStrictEqual(new DeadImport().violations(doc), []);
  });
  it('ignores heading examples inside fenced code', () => {
    const dir = temp();
    const doc = document(dir, '```markdown\n# Load @absent.md\n```\n');
    assert.deepStrictEqual(new DeadImport().violations(doc), []);
  });
  it('accepts headings without imports', () => {
    const dir = temp();
    const doc = document(dir, '# Gates\n## Rules\n');
    assert.deepStrictEqual(new DeadImport().violations(doc), []);
  });
});
