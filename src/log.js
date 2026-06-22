/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const pc = require('picocolors');

/**
 * Log.
 *
 * The diagnostic voice of a run. Holds a verbosity switch, two streams,
 * and a paint that tints a string. Results reach the output stream
 * through info, while debug notes, painted gray, reach the error stream
 * only when verbose is on. Errors reach the error stream through error,
 * plain and always, regardless of verbosity. Keeps the result stream
 * free of diagnostic noise, so a piped report stays clean.
 */
class Log {
  constructor(verbose, out = process.stdout, err = process.stderr, paint = pc.gray) {
    this.verbose = verbose;
    this.out = out;
    this.err = err;
    this.paint = paint;
  }
  info(message) {
    this.out.write(`${message}\n`);
  }
  debug(message) {
    if (this.verbose) {
      this.err.write(`${this.paint(message)}\n`);
    }
  }
  error(message) {
    this.err.write(`${message}\n`);
  }
}

module.exports = Log;
