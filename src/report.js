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
 */
class Report {
  constructor(tool, violations, millis = null) {
    this.tool = tool;
    this.bag = violations;
    this.millis = millis;
  }
  count() {
    return this.bag.length;
  }
  text() {
    const suffix = this.millis === null ? '' : ` in ${prettyMs(this.millis)}`;
    return this.bag
      .map((violation) => violation.text())
      .concat(`${this.bag.length} problems found${suffix}`)
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
