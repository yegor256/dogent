/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('./violation');
const Verdict = require('./verdict');
const Region = require('./region');

const FLOOR = 0.8;

/**
 * Tells whether a result's message narrates the absence of a clash rather
 * than a clash, so the oracle's own non-findings can be discarded.
 * @param {string} text The message the model attached to its result
 * @return {boolean} True when the text denies any contradiction
 */
const denies = function denies(text) {
  return /\bno (?:\w+\s+)?(?:contradiction|inconsistency|conflict|clash)\b|\bnot a (?:contradiction|conflict|clash)\b/iu.test(text);
};

/**
 * Answer.
 *
 * The oracle's raw reply, treated as untrusted input. Parses the JSON
 * object it carries and turns every well-formed SARIF result back into a
 * native violation, ignoring any result it cannot read. Demands a
 * confidence on every result and drops one that omits it or sits below
 * the floor, so the model's own doubt filters out its guesses. Drops a
 * result whose text denies any contradiction, since the model sometimes
 * narrates a non-finding as a result. Wraps every kept result in a
 * verdict, so the printed warning shows how sure the model was.
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
      if (typeof result.confidence !== 'number' || result.confidence < this.floor) {
        return [];
      }
      if (denies(text)) {
        return [];
      }
      return [new Verdict(
        new Violation(
          result.ruleId || 'oracle',
          result.level || 'warning',
          text,
          new Region(spot.artifactLocation.uri, line, spot.region.startColumn || 1)
        ),
        result.confidence
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
