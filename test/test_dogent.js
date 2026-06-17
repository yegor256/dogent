/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

const manifesto = (body) => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'CLAUDE.md');
  fs.writeFileSync(file, body);
  return file;
};

const run = (args, env = {}) => spawnSync(
  'node',
  [path.join(__dirname, '../src/dogent.js'), ...args],
  {encoding: 'utf8', env: {...process.env, ...env}}
);

describe('dogent', () => {
  it('exits non-zero when a manifesto breaks a rule', () => {
    const file = manifesto('# This Section Name Is Far Too Long\nShut the gate');
    assert.strictEqual(
      run([file]).status,
      1,
      'a manifesto that breaks rules must make dogent exit with code one'
    );
  });
  it('reports zero problems for a clean manifesto', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      /0 problems found/u.test(run([file], {OPENAI_API_KEY: ''}).stdout),
      'a clean manifesto must report zero problems'
    );
  });
  it('lints default manifestos when handed a directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# This Section Name Is Far Too Long\nShut');
    assert.strictEqual(
      run([dir]).status,
      1,
      'a directory holding a broken manifesto must exit with code one'
    );
  });
  it('skips the LLM when handed the offline flag', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      /0 problems found/u.test(run(['--offline', file], {OPENAI_API_KEY: 'sk-broken-token'}).stdout),
      'the --offline flag must keep dogent away from the LLM even with a token'
    );
  });
  it('exits with a usage error on an unknown option', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.strictEqual(
      run(['--bogus', file], {OPENAI_API_KEY: ''}).status,
      2,
      'an unknown option must make dogent exit with code two'
    );
  });
  it('prints each scanned manifesto path', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      run([file], {OPENAI_API_KEY: ''}).stderr.includes(`Scanning ${file}`),
      'dogent must announce every file it scans'
    );
  });
});

describe('dogent rules count', () => {
  it('reports how many rules it applied', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.match(
      run([file], {OPENAI_API_KEY: ''}).stderr,
      /[0-9]+ rules applied/u,
      'dogent must report the count of rules contributed to the study'
    );
  });
});

describe('dogent help', () => {
  it('exits with success when asked for help', () => {
    assert.strictEqual(
      run(['--help'], {OPENAI_API_KEY: ''}).status,
      0,
      'the --help flag must make dogent exit with code zero'
    );
  });
  it('prints the usage banner when asked for help', () => {
    assert.ok(
      run(['--help'], {OPENAI_API_KEY: ''}).stdout.includes('Usage: dogent'),
      'the --help flag must print the usage banner on standard output'
    );
  });
});

describe('dogent version', () => {
  it('exits with success when asked for the version', () => {
    assert.strictEqual(
      run(['--version'], {OPENAI_API_KEY: ''}).status,
      0,
      'the --version flag must make dogent exit with code zero'
    );
  });
  it('prints a dotted number triple when asked for the version', () => {
    assert.ok(
      /[0-9]+\.[0-9]+\.[0-9]/u.test(run(['--version'], {OPENAI_API_KEY: ''}).stdout),
      'the --version flag must print a semantic version on standard output'
    );
  });
});
