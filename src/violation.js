/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Violation.
 *
 * One breach of one rule at one region of a manifesto. Renders itself
 * either as a terse human line or as a SARIF result.
 */
class Violation {
  constructor(rule, level, message, region) {
    this.rule = rule;
    this.level = level;
    this.message = message;
    this.spot = region;
  }
  text() {
    return [
      `${this.spot.uri()}:${this.spot.line()}:${this.spot.column()}`,
      this.level,
      this.rule,
      this.message
    ].join(' ');
  }
  sarif() {
    return {
      ruleId: this.rule,
      level: this.level,
      message: {text: this.message},
      locations: [{physicalLocation: this.spot.sarif()}]
    };
  }
}

module.exports = Violation;
