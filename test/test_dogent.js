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
      /0 problems found/u.test(run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr),
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
      /0 problems found/u.test(run(['--offline', '--verbose', file], {OPENAI_API_KEY: 'sk-broken-token'}).stderr),
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
});

describe('dogent verbose', () => {
  it('prints each scanned manifesto path under the verbose flag', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr.includes(`Scanning ${file}`),
      'dogent must announce every file it scans when verbose'
    );
  });
  it('hides the scanning notes without the verbose flag', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      !run([file], {OPENAI_API_KEY: ''}).stderr.includes('Scanning'),
      'a quiet run cannot leak diagnostic notes onto the error stream'
    );
  });
});

describe('dogent file size', () => {
  it('announces the line count and byte size of a scanned manifesto', () => {
    const body = '# Kitchen\nSharpen knife.';
    const file = manifesto(body);
    assert.ok(
      run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr.includes(
        `Scanning ${file} (2 lines, ${Buffer.byteLength(body)} bytes)`
      ),
      'dogent must announce the size of every file it scans'
    );
  });
});

describe('dogent show-prompt', () => {
  it('reveals the AI prompt under the show-prompt flag', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      run(['--show-prompt', file], {
        OPENAI_API_KEY: 'dummy', OPENAI_BASE_URL: 'http://127.0.0.1:1/v1'
      }).stderr.includes('You are a strict linter'),
      'dogent must reveal the AI prompt when asked'
    );
  });
  it('hides the AI prompt without the show-prompt flag', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.ok(
      !run([file], {
        OPENAI_API_KEY: 'dummy', OPENAI_BASE_URL: 'http://127.0.0.1:1/v1'
      }).stderr.includes('You are a strict linter'),
      'a run without --show-prompt cannot leak the AI prompt'
    );
  });
});

describe('dogent missing path', () => {
  it('exits with a readable message when a passed path does not exist', () => {
    const absent = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-')), 'absent.md');
    const out = run([absent], {OPENAI_API_KEY: ''});
    assert.strictEqual(out.status, 2, 'a missing path must make dogent exit with code two');
    assert.ok(
      out.stderr.includes(`No such file or directory: ${absent}`),
      'a missing path must surface a clear stderr message, not a stack trace'
    );
    assert.ok(
      !out.stderr.includes('ENOENT'),
      'a missing path must not leak the raw ENOENT stack trace'
    );
  });
});

describe('dogent local summary', () => {
  it('labels the local summary line on its own', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.match(
      run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr,
      /Locally: 0 problems found/u,
      'dogent must report the locally found problems under their own summary line'
    );
  });
});

describe('dogent rules count', () => {
  it('reports how many rules it applied', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.match(
      run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr,
      /[0-9]+ rules applied/u,
      'dogent must report the count of rules contributed to the study'
    );
  });
});

describe('dogent timing', () => {
  it('prints the analysis duration beside the problem count', () => {
    const file = manifesto('# Kitchen\nSharpen knife.');
    assert.match(
      run(['--verbose', file], {OPENAI_API_KEY: ''}).stderr,
      /problems found in /u,
      'dogent must report how long the analysis took'
    );
  });
});

describe('dogent suppress', () => {
  it('silences a named rule and exits clean', () => {
    const file = manifesto('# Kitchen\nSharpen the knife.');
    assert.ok(
      /0 problems found/u.test(
        run(['--suppress=no-articles', '--verbose', file], {OPENAI_API_KEY: ''}).stderr
      ),
      'a suppressed rule must vanish from the report'
    );
  });
});

describe('dogent hints', () => {
  it('prints a fixing hint for a firing rule when asked', () => {
    const file = manifesto('# This Section Name Is Far Too Long\nShut the gate');
    assert.ok(
      /Trim every section heading/u.test(
        run(['--hints', file], {OPENAI_API_KEY: ''}).stdout
      ),
      'the --hints flag must print a fixing hint for every firing rule'
    );
  });
  it('prints no hints block when not asked', () => {
    const file = manifesto('# This Section Name Is Far Too Long\nShut the gate');
    assert.ok(
      !/Trim every section heading/u.test(
        run([file], {OPENAI_API_KEY: ''}).stdout
      ),
      'a run without --hints must carry no fixing hints'
    );
  });
});

describe('dogent defaults', () => {
  it('reads options from a .dogent file in the current directory', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogent-'));
    fs.writeFileSync(path.join(dir, '.dogent'), '--sarif\n');
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Kitchen\nSharpen knife.');
    const result = spawnSync(
      'node',
      [path.join(__dirname, '../src/dogent.js'), 'CLAUDE.md'],
      {encoding: 'utf8', cwd: dir, env: {...process.env, OPENAI_API_KEY: ''}}
    );
    assert.ok(
      /"version": "2\.1\.0"/u.test(result.stdout),
      'a .dogent file must hand its options to dogent'
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
