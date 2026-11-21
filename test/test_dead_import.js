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

describe('DeadImport inline code', () => {
  [
    'Example: `Load @absent.md`.\n',
    '`@absent.md`',
    'Examples: `Load @first.md` and `Load @second.md`.'
  ].forEach((body) => {
    it(`ignores imports in ${body.trim()}`, () => {
      const doc = document(temp(), body);
      assert.deepStrictEqual(new DeadImport().violations(doc), []);
    });
  });
  [
    'Example: `Load @absent.md`. Load @missing.md.',
    'Load @missing.md. Example: `Load @absent.md`.',
    '`Load @first.md` and `Load @second.md`. Load @missing.md.'
  ].forEach((body) => {
    it(`preserves the real import in ${body}`, () => {
      const doc = document(temp(), `# Gates\n${body}`);
      assert.deepStrictEqual(
        new DeadImport().violations(doc).map((bad) => bad.text()),
        [`${doc.uri()}:2:${body.indexOf('@missing.md') + 1} error [dead-import]: @-import target not found: missing.md`]
      );
    });
  });
});

describe('DeadImport escaped whitespace', () => {
  [
    ['directory space', 'Design Docs/guide.md', 'Design\\ Docs/guide.md'],
    ['filename space', 'guide notes.md', 'guide\\ notes.md'],
    ['multiple spaces', 'Design  Docs/guide notes.md', 'Design\\ \\ Docs/guide\\ notes.md'],
    ['tab', 'Design\tDocs/guide.md', 'Design\\\tDocs/guide.md'],
    ['literal backslash', 'Design\\Docs.md', 'Design\\Docs.md']
  ].forEach(([name, file, token]) => {
    it(`resolves an import containing ${name}`, () => {
      const dir = temp();
      try {
        fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
        write(dir, file, 'Sharpen knife.');
        const doc = document(dir, `# Gates\nLoad @${token}.`);
        assert.deepStrictEqual(new DeadImport().violations(doc), []);
      } finally {
        fs.rmSync(dir, {recursive: true, force: true});
      }
    });
  });
});

describe('DeadImport token boundaries', () => {
  it('reports decoded missing paths at their original columns', () => {
    const dir = temp();
    try {
      const line = 'Load @Design\\ Docs/guide.md and @Other\\ Docs/missing.md.';
      const doc = document(dir, `# Gates\n${line}`);
      assert.deepStrictEqual(
        new DeadImport().violations(doc).map((bad) => bad.text()),
        [
          `${path.join(dir, 'CLAUDE.md')}:2:6 error [dead-import]: @-import target not found: Design Docs/guide.md`,
          `${path.join(dir, 'CLAUDE.md')}:2:${line.indexOf('@Other') + 1} error [dead-import]: @-import target not found: Other Docs/missing.md`
        ]
      );
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
  it('stops at unescaped whitespace after an escaped space', () => {
    const dir = temp();
    try {
      write(dir, 'guide notes.md', 'Sharpen knife.');
      write(dir, 'extra.md', 'Sharpen knife.');
      const doc = document(dir, 'Load @guide\\ notes.md and @extra.md.');
      assert.deepStrictEqual(new DeadImport().violations(doc), []);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
  it('keeps unescaped spaces as import delimiters', () => {
    const dir = temp();
    try {
      write(dir, 'guide', 'Sharpen knife.');
      const doc = document(dir, 'Load @guide notes.md.');
      assert.deepStrictEqual(new DeadImport().violations(doc), []);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
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
