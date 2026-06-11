/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');

describe('dogent', function () {
  it('exits non-zero when a manifesto breaks a rule', function () {
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
  it('reports zero problems for a clean manifesto', function () {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
    fs.writeFileSync(file, '# Kitchen\nSharpen knife');
    const out = execFileSync(
      'node', [path.join(__dirname, '../src/dogent.js'), file], {encoding: 'utf8'}
    );
    assert.ok(/0 problems found/.test(out), 'a clean manifesto must report zero problems');
  });
});
