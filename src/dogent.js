#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const Args = require('./args');
const Defaults = require('./defaults');
const Log = require('./log');
const Markdown = require('./markdown');
const Report = require('./report');
const Sources = require('./sources');
const Openai = require('./openai');
const Oracle = require('./oracle');
const Usage = require('./usage');
const prettyMs = require('pretty-ms');
const version = require('./version');
const rules = require('./rules');

const args = new Args(new Defaults().argv().concat(process.argv.slice(2)));
const sarif = args.sarif();
const log = new Log(args.verbose());
const banner = 'Usage: dogent [options] <file.md|dir>...';
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
    '  --suppress silence a rule by id; repeat or comma-join to silence many\n' +
    '  --hints    append a fixing hint for every rule that reported a violation\n' +
    '  --verbose  print diagnostic notes, scanned files and timings, to stderr\n' +
    '  --openai-http-header  add a "Name: Value" header to OpenAI calls\n' +
    '  --version  show the version and exit\n' +
    '  --help     show this help and exit\n\n' +
    'Defaults:\n' +
    '  A .dogent file in the current directory or home holds default\n' +
    '  options, one per line; options typed by hand override it.\n'
  );
  process.exit(0);
}
const unknown = args.unknown();
if (unknown.length > 0) {
  process.stderr.write(`Unknown option: ${unknown[0]}\n`);
  process.stderr.write(`${banner}\n`);
  process.exit(2);
}
let headers = {};
try {
  headers = args.headers();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(2);
}
const paths = args.paths();
if (paths.length === 0) {
  process.stderr.write(`${banner}\n`);
  process.exit(2);
}
const scan = () => {
  try {
    return new Sources(paths).files();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.stderr.write(`${banner}\n`);
    process.exit(2);
  }
  return [];
};
const scanned = scan();
const bodies = new Map(scanned.map((file) => [file, fs.readFileSync(file, 'utf8')]));
scanned.forEach((file) => {
  const body = bodies.get(file);
  const lines = body === '' ? 0 : body.split('\n').length - (body.endsWith('\n') ? 1 : 0);
  const bytes = Buffer.byteLength(body);
  log.debug(`Scanning ${file} (${lines} lines, ${bytes} bytes)`);
});
const checks = rules();
log.debug(`${scanned.length} files scanned, ${checks.length} rules applied`);
const documents = scanned.map(
  (file) => new Markdown(file, bodies.get(file)).document()
);
const started = Date.now();
const suppressed = args.suppress();
const allowed = (violation) => !suppressed.includes(violation.rule);
const found = [];
documents.forEach((document) => {
  checks.forEach((rule) => {
    rule.violations(document).filter(allowed).forEach((violation) => found.push(violation));
  });
});
const localMillis = Date.now() - started;
const key = process.env.OPENAI_API_KEY;
const audit = async (docs) => {
  const oracle = new Oracle(
    checks,
    new Openai(
      key,
      process.env.OPENAI_MODEL || 'gpt-4o-mini',
      process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      (url, options) => globalThis.fetch(
        url,
        {...options, headers: {...options.headers, ...headers}}
      )
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
const verify = async () => {
  const clock = Date.now();
  const result = await audit(documents);
  return {
    extra: result.extra.filter(allowed),
    usage: result.usage,
    aiMillis: Date.now() - clock
  };
};
const consult = Boolean(key) && !args.offline();
const human = (outcome) => {
  const all = found.concat(outcome.extra);
  log.info(new Report('dogent', found, localMillis, 'Locally').text());
  if (consult) {
    log.info(new Report('dogent', outcome.extra, outcome.aiMillis, 'OpenAI').text());
  }
  if (args.hints() && all.length > 0) {
    log.info(`\n${new Report('dogent', all).hints(checks)}`);
  }
};
const render = (outcome) => {
  const all = found.concat(outcome.extra);
  if (sarif) {
    const report = new Report('dogent', all, localMillis + outcome.aiMillis);
    log.info(JSON.stringify(report.sarif(), null, 2));
  } else {
    human(outcome);
  }
  if (outcome.usage !== null) {
    log.debug(`${outcome.usage.text(outcome.extra.length)}, analysed in ${prettyMs(outcome.aiMillis)}`);
  }
  process.exit(all.length > 0 ? 1 : 0);
};
(async () => {
  let outcome = {extra: [], aiMillis: 0, usage: null};
  if (consult) {
    try {
      outcome = await verify();
    } catch (error) {
      process.stderr.write(`AI verification failed: ${error.message}\n`);
      process.exit(2);
    }
  }
  render(outcome);
})();
