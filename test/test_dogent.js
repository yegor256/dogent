/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync, spawnSync} = require('child_process');

describe('dogent', () => {
  it('exits non-zero when a manifesto breaks a rule', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
    fs.writeFileSync(file, '# This Section Name Is Far Too Long\nShut the gate');
    let code = 0;
    try {
      execFileSync(
        'node', [path.join(__dirname, '../src/dogent.js'), file], {encoding: 'utf8'}
      );
    } catch (error) {
      code = error.status;
    }
    assert.strictEqual(
      code, 1, 'a manifesto that breaks rules must make dogent exit with code one'
    );
  });
  it('reports zero problems for a clean manifesto', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife.');
    const out = execFileSync(
      'node', [path.join(__dirname, '../src/dogent.js'), file], {encoding: 'utf8'}
    );
    assert.ok(/0 problems found/u.test(out), 'a clean manifesto must report zero problems');
  });
  it('lints default manifestos when handed a directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# This Section Name Is Far Too Long\nShut');
    let code = 0;
    try {
      execFileSync(
        'node', [path.join(__dirname, '../src/dogent.js'), dir], {encoding: 'utf8'}
      );
    } catch (error) {
      code = error.status;
    }
    assert.strictEqual(code, 1, 'a directory holding a broken manifesto must exit with code one');
  });
  it('prints each scanned manifesto path', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife.');
    const run = spawnSync(
      'node', [path.join(__dirname, '../src/dogent.js'), file], {encoding: 'utf8'}
    );
    assert.ok(
      run.stderr.includes(`Scanning ${file}`), 'dogent must announce every file it scans'
    );
  });
});
