/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const path = require('path');
const Defaults = require('../src/defaults');

const fake = (files) => new Defaults(
  Object.keys(files).map((file) => path.dirname(file)),
  (file) => Object.hasOwn(files, file),
  (file) => files[file]
);

describe('Defaults parsing', () => {
  it('reads one flag from a single-line file', () => {
    assert.deepStrictEqual(
      fake({'/here/.dogent': '--sarif\n'}).argv(),
      ['--sarif'],
      'a lone flag must turn into one argv token'
    );
  });
  it('splits an option and its value on one line', () => {
    assert.deepStrictEqual(
      fake({'/here/.dogent': '--suppress foo\n'}).argv(),
      ['--suppress', 'foo'],
      'an option and its value must split into two tokens'
    );
  });
  it('drops a blank line', () => {
    assert.deepStrictEqual(
      fake({'/here/.dogent': '\n--offline\n\n'}).argv(),
      ['--offline'],
      'a blank line must add no argv token'
    );
  });
  it('drops a comment line', () => {
    assert.deepStrictEqual(
      fake({'/here/.dogent': '# notes here\n--offline\n'}).argv(),
      ['--offline'],
      'a line that opens with a hash must read as a comment'
    );
  });
});

describe('Defaults lookup', () => {
  it('returns nothing when no file exists', () => {
    assert.deepStrictEqual(
      fake({}).argv(),
      [],
      'a missing file must yield no defaults'
    );
  });
  it('prefers the current directory over the home', () => {
    assert.deepStrictEqual(
      fake({'/here/.dogent': '--sarif\n', '/home/.dogent': '--offline\n'}).argv(),
      ['--sarif'],
      'a file in the current directory must win over the home'
    );
  });
  it('falls back to the home when the current directory lacks one', () => {
    assert.deepStrictEqual(
      new Defaults(
        ['/here', '/home'],
        (file) => file === '/home/.dogent',
        () => '--offline\n'
      ).argv(),
      ['--offline'],
      'the home file must serve when the current directory has none'
    );
  });
});
