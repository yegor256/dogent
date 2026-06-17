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
const prettyMs = require('pretty-ms');
const version = require('./version');
const rules = require('./rules');

const args = new Args(process.argv.slice(2));
const sarif = args.sarif();
const banner = 'Usage: dogent [--sarif] [--offline] <file.md|dir>...';
if (args.version()) {
  process.stdout.write(`${version}\n`);
  process.exit(0);
}
if (args.help()) {
  process.stdout.write(
    `${banner}\n\n` +
    'Lint agentic manifesto files like SKILL.md and CLAUDE.md.\n\n' +
    'Options:\n' +
    '  --sarif    render the report as SARIF JSON\n' +
    '  --offline  never call the LLM, even when a token exists\n' +
    '  --version  show the version and exit\n' +
    '  --help     show this help and exit\n'
  );
  process.exit(0);
}
const unknown = args.unknown();
if (unknown.length > 0) {
  process.stderr.write(`Unknown option: ${unknown[0]}\n`);
  process.stderr.write(`${banner}\n`);
  process.exit(2);
}
const paths = args.paths();
if (paths.length === 0) {
  process.stderr.write(`${banner}\n`);
  process.exit(2);
}
const scanned = new Sources(paths).files();
scanned.forEach((file) => process.stderr.write(`Scanning ${file}\n`));
const checks = rules();
process.stderr.write(`${scanned.length} files scanned, ${checks.length} rules applied\n`);
const documents = scanned.map(
  (file) => new Markdown(file, fs.readFileSync(file, 'utf8')).document()
);
const started = Date.now();
const found = [];
documents.forEach((document) => {
  checks.forEach((rule) => {
    rule.violations(document).forEach((violation) => found.push(violation));
  });
});
const key = process.env.OPENAI_API_KEY;
const audit = async (docs) => {
  const oracle = new Oracle(
    checks,
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
const finish = (usage, aiMillis) => {
  const report = new Report('dogent', found, Date.now() - started);
  process.stdout.write(`${sarif ? JSON.stringify(report.sarif(), null, 2) : report.text()}\n`);
  if (usage !== null) {
    process.stderr.write(`${usage.text()}, analysed in ${prettyMs(aiMillis)}\n`);
  }
  process.exit(report.count() > 0 ? 1 : 0);
};
const verify = async () => {
  const clock = Date.now();
  const result = await audit(documents);
  result.extra.forEach((violation) => found.push(violation));
  return {usage: result.usage, aiMillis: Date.now() - clock};
};
(async () => {
  let outcome = {aiMillis: 0, usage: null};
  if (found.length === 0 && key && !args.offline()) {
    try {
      outcome = await verify();
    } catch (error) {
      process.stderr.write(`AI verification failed: ${error.message}\n`);
      process.exit(2);
    }
  }
  finish(outcome.usage, outcome.aiMillis);
})();
