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
