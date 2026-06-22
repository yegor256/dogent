/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Args = require('../src/args');

describe('Args paths', () => {
  it('keeps every path that carries no dash', () => {
    assert.deepStrictEqual(
      new Args(['CLAUDE.md', 'SKILL.md']).paths(),
      ['CLAUDE.md', 'SKILL.md'],
      'plain file arguments must survive parsing'
    );
  });
  it('drops recognized flags from the paths', () => {
    assert.deepStrictEqual(
      new Args(['--sarif', 'CLAUDE.md']).paths(),
      ['CLAUDE.md'],
      'flags must never leak into the path list'
    );
  });
  it('collects an unknown option', () => {
    assert.deepStrictEqual(
      new Args(['--bogus', 'CLAUDE.md']).unknown(),
      ['--bogus'],
      'an unrecognized option must be reported'
    );
  });
  it('finds nothing unknown among recognized flags', () => {
    assert.deepStrictEqual(
      new Args(['--sarif', '--offline', 'CLAUDE.md']).unknown(),
      [],
      'recognized flags must never count as unknown'
    );
  });
  it('treats a dashed token after the separator as a path', () => {
    assert.deepStrictEqual(
      new Args(['--', '-weird.md']).paths(),
      ['-weird.md'],
      'tokens past the -- separator must stay paths even with a dash'
    );
  });
  it('reports nothing unknown for a token past the separator', () => {
    assert.deepStrictEqual(
      new Args(['--', '-weird.md']).unknown(),
      [],
      'tokens past the -- separator must never count as unknown'
    );
  });
});

describe('Args flags', () => {
  it('detects the sarif flag', () => {
    assert.strictEqual(
      new Args(['--sarif', 'CLAUDE.md']).sarif(),
      true,
      'the --sarif flag must switch the report to SARIF'
    );
  });
  it('reports no sarif flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).sarif(),
      false,
      'a missing --sarif flag must leave the report plain'
    );
  });
  it('detects the offline flag', () => {
    assert.strictEqual(
      new Args(['--offline', 'CLAUDE.md']).offline(),
      true,
      'the --offline flag must forbid talking to the LLM'
    );
  });
  it('reports no offline flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).offline(),
      false,
      'a missing --offline flag must allow the LLM'
    );
  });
  it('reads the sarif flag from the equals syntax', () => {
    assert.strictEqual(
      new Args(['--sarif=false', 'CLAUDE.md']).sarif(),
      false,
      'the --flag=value syntax must drive the sarif option'
    );
  });
});

describe('Args help', () => {
  it('detects the long help flag', () => {
    assert.strictEqual(
      new Args(['--help']).help(),
      true,
      'the --help flag must ask dogent for its usage'
    );
  });
  it('detects the short help flag', () => {
    assert.strictEqual(
      new Args(['-h']).help(),
      true,
      'the -h flag must ask dogent for its usage'
    );
  });
  it('reports no help flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).help(),
      false,
      'a missing help flag must let dogent lint as usual'
    );
  });
  it('never counts the help flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--help']).unknown(),
      [],
      'the help flag must never count as an unrecognized option'
    );
  });
  it('never counts the short help flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['-h']).unknown(),
      [],
      'the short help flag must never count as an unrecognized option'
    );
  });
});

describe('Args suppress', () => {
  it('reads a single suppressed rule', () => {
    assert.deepStrictEqual(
      new Args(['--suppress=name-matches-dir', 'CLAUDE.md']).suppress(),
      ['name-matches-dir'],
      'a lone --suppress must name one silenced rule'
    );
  });
  it('splits a comma-joined suppress list', () => {
    assert.deepStrictEqual(
      new Args(['--suppress=name-matches-dir,foo,bar', 'CLAUDE.md']).suppress(),
      ['name-matches-dir', 'foo', 'bar'],
      'a comma-joined --suppress must split into many rules'
    );
  });
  it('merges repeated suppress options', () => {
    assert.deepStrictEqual(
      new Args(['--suppress=foo', '--suppress=bar', 'CLAUDE.md']).suppress(),
      ['foo', 'bar'],
      'repeated --suppress options must all take effect'
    );
  });
  it('suppresses nothing when the option is absent', () => {
    assert.deepStrictEqual(
      new Args(['CLAUDE.md']).suppress(),
      [],
      'a missing --suppress must silence no rule'
    );
  });
  it('never counts the suppress option as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--suppress=foo', 'CLAUDE.md']).unknown(),
      [],
      'the suppress option must never count as unrecognized'
    );
  });
});

describe('Args headers', () => {
  it('reads a single custom header', () => {
    assert.deepStrictEqual(
      new Args(['--openai-http-header=X-Api-Key: secret', 'CLAUDE.md']).headers(),
      {'X-Api-Key': 'secret'},
      'a lone --openai-http-header must yield one name and value'
    );
  });
  it('merges repeated header options', () => {
    assert.deepStrictEqual(
      new Args([
        '--openai-http-header=X-Api-Key: secret',
        '--openai-http-header=X-Tenant: acme',
        'CLAUDE.md'
      ]).headers(),
      {'X-Api-Key': 'secret', 'X-Tenant': 'acme'},
      'repeated --openai-http-header options must all reach the request'
    );
  });
  it('keeps a colon inside the header value', () => {
    assert.deepStrictEqual(
      new Args(['--openai-http-header=X-Url: https://corp.example', 'CLAUDE.md']).headers(),
      {'X-Url': 'https://corp.example'},
      'only the first colon must split a header, not the ones inside its value'
    );
  });
  it('adds no header when the option is absent', () => {
    assert.deepStrictEqual(
      new Args(['CLAUDE.md']).headers(),
      {},
      'a missing --openai-http-header must add no header'
    );
  });
  it('rejects a header that carries no colon', () => {
    assert.throws(
      () => new Args(['--openai-http-header=bogus', 'CLAUDE.md']).headers(),
      'a header without a colon cannot split into a name and value'
    );
  });
  it('never counts the header option as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--openai-http-header=X-Api-Key: secret', 'CLAUDE.md']).unknown(),
      [],
      'the header option must never count as unrecognized'
    );
  });
});

describe('Args hints', () => {
  it('detects the hints flag', () => {
    assert.strictEqual(
      new Args(['--hints', 'CLAUDE.md']).hints(),
      true,
      'the --hints flag must ask dogent for fixing hints'
    );
  });
  it('reports no hints flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).hints(),
      false,
      'a missing --hints flag must leave the report hint-free'
    );
  });
  it('never counts the hints flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--hints', 'CLAUDE.md']).unknown(),
      [],
      'the hints flag must never count as an unrecognized option'
    );
  });
});

describe('Args verbose', () => {
  it('detects the verbose flag', () => {
    assert.strictEqual(
      new Args(['--verbose', 'CLAUDE.md']).verbose(),
      true,
      'the --verbose flag must ask dogent for diagnostic notes'
    );
  });
  it('reports no verbose flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).verbose(),
      false,
      'a missing --verbose flag must keep dogent quiet'
    );
  });
  it('never counts the verbose flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--verbose', 'CLAUDE.md']).unknown(),
      [],
      'the verbose flag must never count as an unrecognized option'
    );
  });
});

describe('Args show-prompt', () => {
  it('detects the show-prompt flag', () => {
    assert.strictEqual(
      new Args(['--show-prompt', 'CLAUDE.md']).showPrompt(),
      true,
      'the --show-prompt flag must ask dogent to reveal the AI prompt'
    );
  });
  it('reports no show-prompt flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).showPrompt(),
      false,
      'a missing --show-prompt flag must keep the AI prompt hidden'
    );
  });
  it('never counts the show-prompt flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--show-prompt', 'CLAUDE.md']).unknown(),
      [],
      'the show-prompt flag must never count as an unrecognized option'
    );
  });
});

describe('Args model', () => {
  it('reads the chosen model', () => {
    assert.strictEqual(
      new Args(['--model=gpt-4o', 'CLAUDE.md']).model(),
      'gpt-4o',
      'the --model option must name the LLM to consult'
    );
  });
  it('reports an empty model when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).model(),
      '',
      'a missing --model must leave the model unchosen'
    );
  });
  it('lets the last model win when repeated', () => {
    assert.strictEqual(
      new Args(['--model=gpt-4o', '--model=o3', 'CLAUDE.md']).model(),
      'o3',
      'a repeated --model must keep the last value typed'
    );
  });
  it('never counts the model option as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--model=gpt-4o', 'CLAUDE.md']).unknown(),
      [],
      'the model option must never count as unrecognized'
    );
  });
});

describe('Args token', () => {
  it('reads the chosen token', () => {
    assert.strictEqual(
      new Args(['--token=sk-secret', 'CLAUDE.md']).token(),
      'sk-secret',
      'the --token option must name the API key to send'
    );
  });
  it('reports an empty token when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).token(),
      '',
      'a missing --token must leave the key unchosen'
    );
  });
  it('lets the last token win when repeated', () => {
    assert.strictEqual(
      new Args(['--token=sk-old', '--token=sk-new', 'CLAUDE.md']).token(),
      'sk-new',
      'a repeated --token must keep the last value typed'
    );
  });
  it('never counts the token option as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--token=sk-secret', 'CLAUDE.md']).unknown(),
      [],
      'the token option must never count as unrecognized'
    );
  });
});

describe('Args version', () => {
  it('detects the version flag', () => {
    assert.strictEqual(
      new Args(['--version']).version(),
      true,
      'the --version flag must ask dogent for its release'
    );
  });
  it('reports no version flag when absent', () => {
    assert.strictEqual(
      new Args(['CLAUDE.md']).version(),
      false,
      'a missing version flag must let dogent lint as usual'
    );
  });
  it('never counts the version flag as unknown', () => {
    assert.deepStrictEqual(
      new Args(['--version']).unknown(),
      [],
      'the version flag must never count as an unrecognized option'
    );
  });
});
