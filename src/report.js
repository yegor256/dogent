/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

/**
 * Report.
 *
 * The whole verdict of a run: the tool that produced it and every
 * violation it gathered. Renders itself for humans or as a SARIF log.
 */
class Report {
  constructor(tool, violations) {
    this.tool = tool;
    this.bag = violations;
  }
  count() {
    return this.bag.length;
  }
  text() {
    return this.bag
      .map((violation) => violation.text())
      .concat(`${this.bag.length} problems found`)
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
