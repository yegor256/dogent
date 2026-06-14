#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const Args = require('./args');
const Markdown = require('./markdown');
const Report = require('./report');
const Sources = require('./sources');
const Openai = require('./openai');
const Oracle = require('./oracle');
const Usage = require('./usage');
const rules = require('./rules');

const args = new Args(process.argv.slice(2));
const sarif = args.sarif();
const unknown = args.unknown();
if (unknown.length > 0) {
  process.stderr.write(`Unknown option: ${unknown[0]}\n`);
  process.stderr.write('Usage: dogent [--sarif] [--offline] <file.md|dir>...\n');
  process.exit(2);
}
const paths = args.paths();
if (paths.length === 0) {
  process.stderr.write('Usage: dogent [--sarif] [--offline] <file.md|dir>...\n');
  process.exit(2);
}
const scanned = new Sources(paths).files();
scanned.forEach((file) => process.stderr.write(`Scanning ${file}\n`));
process.stderr.write(`${scanned.length} files scanned\n`);
const documents = scanned.map(
  (file) => new Markdown(file, fs.readFileSync(file, 'utf8')).document()
);
const found = [];
documents.forEach((document) => {
  rules().forEach((rule) => {
    rule.violations(document).forEach((violation) => found.push(violation));
  });
});
const key = process.env.OPENAI_API_KEY;
const audit = async (docs) => {
  const oracle = new Oracle(
    rules(),
    new Openai(
      key,
      process.env.OPENAI_MODEL || 'gpt-4o-mini',
      (url, options) => globalThis.fetch(url, options)
    )
  );
  const replies = await Promise.all(docs.map((doc) => oracle.violations(doc)));
  return replies.reduce(
    (acc, reply) => ({
      extra: acc.extra.concat(reply.found),
      usage: acc.usage.plus(reply.usage)
    }),
    {extra: [], usage: new Usage('', 0, 0)}
  );
};
const finish = (usage) => {
  const report = new Report('dogent', found);
  process.stdout.write(`${sarif ? JSON.stringify(report.sarif(), null, 2) : report.text()}\n`);
  if (usage !== null) {
    process.stderr.write(`${usage.text()}\n`);
  }
  process.exit(report.count() > 0 ? 1 : 0);
};
(async () => {
  let usage = null;
  if (found.length === 0 && key && !args.offline()) {
    try {
      const result = await audit(documents);
      result.extra.forEach((violation) => found.push(violation));
      ({usage} = result);
    } catch (error) {
      process.stderr.write(`AI verification failed: ${error.message}\n`);
      process.exit(2);
    }
  }
  finish(usage);
})();
