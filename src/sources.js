/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PRUNED = ['node_modules', '.git'];

/**
 * Sources.
 *
 * The paths passed on the command line. Each path names either one
 * manifesto file or one directory. A directory expands into the default
 * manifesto files it holds, scanned recursively through every subfolder,
 * so `dogent .` lints every known manifesto in the whole tree.
 */
class Sources {
  constructor(paths, defaults = ['AGENTS.md', 'CLAUDE.md', 'SKILL.md', 'SKILLS.md']) {
    this.paths = paths;
    this.defaults = defaults;
  }
  files() {
    const found = [];
    this.paths.forEach((entry) => {
      if (!fs.existsSync(entry)) {
        throw new Error(`No such file or directory: ${entry}`);
      }
      if (fs.statSync(entry).isDirectory()) {
        this.scan(entry, found);
      } else {
        found.push(entry);
      }
    });
    return found;
  }
  scan(dir, found) {
    this.defaults.forEach((name) => {
      const file = path.join(dir, name);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        found.push(file);
      }
    });
    fs.readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
      if (entry.isDirectory() && !PRUNED.includes(entry.name)) {
        this.scan(path.join(dir, entry.name), found);
      }
    });
  }
}

module.exports = Sources;
