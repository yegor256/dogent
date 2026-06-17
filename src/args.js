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
 * any talk to the LLM even when a token sits in the environment. The `--help`
 * flag, also spelled `-h`, asks for the usage banner. The `--version` flag
 * asks for the release number. The `--suppress` option names a rule to
 * silence; repeat it or join names with commas to silence many at once. The
 * `--openai-http-header` option adds one `Name: Value` header to every OpenAI
 * call; repeat it to add many. Everything after a `--` separator counts as a
 * path, never as an option.
 */
class Args {
  constructor(
    argv,
    flags = ['sarif', 'offline', 'help', 'version'],
    options = ['suppress', 'openai-http-header']
  ) {
    this.flags = flags;
    this.options = options;
    this.parsed = minimist(
      argv,
      {boolean: flags, string: options, alias: {help: 'h'}, '--': true}
    );
  }
  sarif() {
    return this.parsed.sarif === true;
  }
  offline() {
    return this.parsed.offline === true;
  }
  help() {
    return this.parsed.help === true;
  }
  version() {
    return this.parsed.version === true;
  }
  suppress() {
    return [].concat(this.parsed.suppress || [])
      .flatMap((item) => String(item).split(','))
      .map((name) => name.trim())
      .filter((name) => name !== '');
  }
  headers() {
    return [].concat(this.parsed['openai-http-header'] || [])
      .map(String)
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .reduce((acc, line) => {
        const at = line.indexOf(':');
        if (at < 0) {
          throw new Error(`Malformed header "${line}", expected "Name: Value"`);
        }
        return {...acc, [line.slice(0, at).trim()]: line.slice(at + 1).trim()};
      }, {});
  }
  paths() {
    return this.parsed._.concat(this.parsed['--']).map(String);
  }
  unknown() {
    return Object.keys(this.parsed)
      .filter((key) => key !== '_' && key !== '--' && key !== 'h' &&
        !this.flags.includes(key) && !this.options.includes(key))
      .map((key) => `${key.length === 1 ? '-' : '--'}${key}`);
  }
}

module.exports = Args;
