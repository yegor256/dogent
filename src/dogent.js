#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const Markdown = require('./markdown');
const Report = require('./report');
const Sources = require('./sources');
const rules = require('./rules');

const argv = process.argv.slice(2);
const sarif = argv.indexOf('--sarif') !== -1;
const paths = argv.filter((arg) => arg !== '--sarif');
if (paths.length === 0) {
  process.stderr.write('Usage: dogent [--sarif] <file.md|dir>...\n');
  process.exit(2);
}
const scanned = new Sources(paths).files();
scanned.forEach((file) => process.stderr.write(`Scanning ${file}\n`));
process.stderr.write(`${scanned.length} files scanned\n`);
const found = [];
scanned.forEach((file) => {
  const document = new Markdown(file, fs.readFileSync(file, 'utf8')).document();
  rules().forEach((rule) => {
    rule.violations(document).forEach((violation) => found.push(violation));
  });
});
const report = new Report('dogent', found);
process.stdout.write(`${sarif ? JSON.stringify(report.sarif(), null, 2) : report.text()}\n`);
process.exit(report.count() > 0 ? 1 : 0);
