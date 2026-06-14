/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const minimist = require('minimist');

/**
 * Args.
 *
 * The command-line arguments handed to dogent. It leans on minimist to split
 * the raw argv into recognized options and the manifesto paths that remain.
 * The `--sarif` flag switches the report to SARIF, while `--offline` forbids
 * any talk to the LLM even when a token sits in the environment. Everything
 * after a `--` separator counts as a path, never as an option.
 */
class Args {
  constructor(argv, flags = ['sarif', 'offline']) {
    this.flags = flags;
    this.parsed = minimist(argv, {boolean: flags, '--': true});
  }
  sarif() {
    return this.parsed.sarif === true;
  }
  offline() {
    return this.parsed.offline === true;
  }
  paths() {
    return this.parsed._.concat(this.parsed['--']).map(String);
  }
  unknown() {
    return Object.keys(this.parsed)
      .filter((key) => key !== '_' && key !== '--' && !this.flags.includes(key))
      .map((key) => `${key.length === 1 ? '-' : '--'}${key}`);
  }
}

module.exports = Args;
