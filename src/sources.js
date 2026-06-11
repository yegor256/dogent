/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Sources.
 *
 * The paths passed on the command line. Each path names either one
 * manifesto file or one directory. A directory expands into the default
 * manifesto files it actually contains, so `dogent .` lints every known
 * manifesto in the current folder.
 */
class Sources {
  constructor(paths, defaults = ['AGENTS.md', 'CLAUDE.md', 'SKILL.md', 'SKILLS.md']) {
    this.paths = paths;
    this.defaults = defaults;
  }
  files() {
    const found = [];
    this.paths.forEach((entry) => {
      if (fs.statSync(entry).isDirectory()) {
        this.defaults.forEach((name) => {
          const file = path.join(entry, name);
          if (fs.existsSync(file)) {
            found.push(file);
          }
        });
      } else {
        found.push(entry);
      }
    });
    return found;
  }
}

module.exports = Sources;
