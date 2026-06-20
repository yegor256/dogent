/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Defaults.
 *
 * The default command-line options pulled from a `.dogent` file. Dogent looks
 * first in the current directory, then in the user home, and reads the first
 * file it finds. Each line names one option, written exactly as typed on the
 * command line, with its value after a space. A blank line vanishes, and a
 * line that opens with `#` reads as a comment. These options sit ahead of the
 * real argv, so any flag typed by hand overrides the file.
 */
class Defaults {
  constructor(
    dirs = [process.cwd(), os.homedir()],
    exists = (file) => fs.existsSync(file),
    reader = (file) => fs.readFileSync(file, 'utf8')
  ) {
    this.dirs = dirs;
    this.exists = exists;
    this.reader = reader;
  }
  argv() {
    const file = this.dirs
      .map((dir) => path.join(dir, '.dogent'))
      .find((candidate) => this.exists(candidate));
    if (!file) {
      return [];
    }
    return this.reader(file)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .flatMap((line) => {
        const separator = line.search(/\s/u);
        return separator < 0
          ? [line]
          : [line.slice(0, separator), line.slice(separator).trimStart()];
      });
  }
}

module.exports = Defaults;
