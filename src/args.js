/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Args.
 *
 * The command-line arguments handed to dogent. It splits the raw argv into
 * recognized options and the manifesto paths that remain. The `--sarif`
 * flag switches the report to SARIF, while `--offline` forbids any talk to
 * the LLM even when a token sits in the environment.
 */
class Args {
  constructor(argv, flags = ['--sarif', '--offline']) {
    this.argv = argv;
    this.flags = flags;
  }
  sarif() {
    return this.argv.includes('--sarif');
  }
  offline() {
    return this.argv.includes('--offline');
  }
  paths() {
    return this.argv.filter((arg) => !arg.startsWith('-'));
  }
  unknown() {
    return this.argv.filter(
      (arg) => arg.startsWith('-') && !this.flags.includes(arg)
    );
  }
}

module.exports = Args;
