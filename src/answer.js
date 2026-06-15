/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('./violation');
const Region = require('./region');

const FLOOR = 0.8;

/**
 * Answer.
 *
 * The oracle's raw reply, treated as untrusted input. Parses the JSON
 * object it carries and turns every well-formed SARIF result back into a
 * native violation, ignoring any result it cannot read. Drops a result
 * whose self-reported confidence sits below the floor, so the model's
 * own doubt filters out its guesses; a result without a confidence is
 * trusted and kept.
 */
class Answer {
  constructor(raw, floor = FLOOR) {
    this.raw = raw;
    this.floor = floor;
  }
  violations() {
    return this.results().flatMap((result) => {
      const spot = result?.locations?.[0]?.physicalLocation;
      const line = spot?.region?.startLine;
      const text = result?.message?.text;
      if (typeof line !== 'number' || typeof text !== 'string' || !spot.artifactLocation) {
        return [];
      }
      if (typeof result.confidence === 'number' && result.confidence < this.floor) {
        return [];
      }
      return [new Violation(
        result.ruleId || 'oracle',
        result.level || 'warning',
        text,
        new Region(spot.artifactLocation.uri, line, spot.region.startColumn || 1)
      )];
    });
  }
  results() {
    try {
      return JSON.parse(this.raw).results || [];
    } catch (error) {
      throw new Error(`oracle returned malformed JSON: ${error.message}`, {cause: error});
    }
  }
}

module.exports = Answer;
