/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Markdown = require('../src/markdown');
const pipeline = require('../src/rules');

/**
 * Rules whose violations() always returns an empty array because they own
 * no deterministic detector and defer entirely to the AI oracle. They can
 * never fire from a fixture alone, so the coverage requirement excludes
 * them. Today `consistent` is the only such rule.
 */
const ORACLE_ONLY = new Set(['consistent']);

const URI = 'skills/gadget/SKILL.md';

/**
 * Discover every rule id by reading the source files in src/rules/ and
 * pulling the `this.id = '<id>';` literal out of each. The list is built
 * at runtime, never hard-coded, so a new rule file joins the coverage
 * check the moment it lands.
 * @return {Set<string>} The discovered rule ids.
 */
const discover = () => {
  const dir = path.join(__dirname, '../src/rules');
  const ids = fs.readdirSync(dir)
    .filter((file) => file.endsWith('.js') && file !== 'index.js')
    .map((file) => fs.readFileSync(path.join(dir, file), 'utf8'))
    .map((body) => body.match(/this\.id = '(?<id>[^']+)';/u))
    .filter((match) => match !== null)
    .map((match) => match.groups.id);
  return new Set(ids);
};

/**
 * Build a long crowded section whose body trips every prose-level rule
 * and, through sheer padding, the token-count and concise caps too.
 * @return {string} The section text.
 */
const section = () => {
  const lines = [
    'It is written by the agent.',
    'Read the file and obey.',
    'You are a senior reviewer.',
    'Do not skip a step.',
    'Please keep things clean.',
    'Fill the <placeholder> here.',
    'this drifts; it splits.',
    'fix it properly, and do good work, when you can, if needed',
    'Should you hover, just wait.',
    'Be helpful',
    'Be helpful',
    'IMPORTANT rule here now.',
    'Run the script.',
    'Avoid writing `goto`.',
    'Because clarity matters, keep short.',
    'Follow the rule mentioned above.',
    'Open the directory.',
    'Open the folder.',
    '**Setup:**',
    '- First sharpen the blade.'
  ];
  const pad = [];
  for (let num = 0; num < 900; num += 1) {
    pad.push(`Sharpen tool number ${num} now.`);
  }
  return ['## Steps', ...lines, ...pad].join('\n');
};

/**
 * Assemble one SKILL.md fixture crafted to trip every deterministic rule.
 * @return {string} The manifesto body.
 */
const fixture = () => [
  '---',
  'name: Gadget Skill',
  'description: short',
  'license: MIT',
  'forbidden: yes',
  '---',
  'Loose instruction floats here before any heading.',
  '## This Heading Has Four Words',
  '### Too Deep',
  '## Hollow',
  '## More',
  'See @missing/no-such-file.md for detail.',
  `This line runs far beyond the eighty symbol ceiling so it trips ${'x'.repeat(60)}.`,
  'It produces output every run.',
  section()
].join('\n');

/**
 * Run the whole pipeline over the fixture and collect the ids of rules
 * that produced at least one violation.
 * @return {Set<string>} The fired rule ids.
 */
const fire = () => {
  const doc = new Markdown(URI, fixture()).document();
  const fired = new Set();
  pipeline().forEach((rule) => {
    if (rule.violations(doc).length > 0) {
      fired.add(rule.id);
    }
  });
  return fired;
};

describe('coverage', () => {
  it('triggers every deterministic rule', () => {
    const fired = fire();
    const missing = [...discover()]
      .filter((id) => !ORACLE_ONLY.has(id) && !fired.has(id))
      .sort();
    assert.deepStrictEqual(
      missing, [], `rules never triggered: ${missing.join(', ')}`
    );
  });
  it('registers every rule file in the pipeline', () => {
    const registered = new Set(pipeline().map((rule) => rule.id));
    const unregistered = [...discover()]
      .filter((id) => !registered.has(id))
      .sort();
    assert.deepStrictEqual(
      unregistered, [], `rule files absent from pipeline: ${unregistered.join(', ')}`
    );
  });
});
