/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const prettyMs = require('pretty-ms');

/**
 * Report.
 *
 * The whole verdict of a run: the tool that produced it and every
 * violation it gathered. Renders itself for humans or as a SARIF log.
 * When handed the analysis duration in milliseconds, the human text
 * closes with a friendly "in 340ms" rendered through pretty-ms.
 * A label tags the summary line, telling local checks from AI ones.
 * Given the rules that ran, it can also render one fixing hint per rule
 * that reported a violation, in first-appearance order.
 */
class Report {
  constructor(tool, violations, millis = null, label = '') {
    this.tool = tool;
    this.bag = violations;
    this.millis = millis;
    this.label = label;
  }
  count() {
    return this.bag.length;
  }
  text() {
    const suffix = this.millis === null ? '' : ` in ${prettyMs(this.millis)}`;
    const prefix = this.label === '' ? '' : `${this.label}: `;
    const lines = this.bag
      .map((violation) => violation.text())
      .concat(`${prefix}${this.bag.length} problems found${suffix}`);
    if (this.bag.length > 0) {
      lines.push(
        'Spotted a false positive? dogent is in beta, please report it at ' +
        'https://github.com/yegor256/dogent/issues'
      );
    }
    return lines.join('\n');
  }
  hints(rules) {
    const byId = new Map(rules.map((rule) => [rule.id, rule]));
    const seen = [];
    this.bag.forEach((violation) => {
      if (!seen.includes(violation.rule) && byId.has(violation.rule)) {
        seen.push(violation.rule);
      }
    });
    return seen
      .map((id) => `[${id}]: ${byId.get(id).hint()}`)
      .join('\n');
  }
  sarif() {
    return {
      version: '2.1.0',
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      runs: [{
        tool: {driver: {name: this.tool, rules: []}},
        results: this.bag.map((violation) => violation.sarif())
      }]
    };
  }
}

module.exports = Report;
