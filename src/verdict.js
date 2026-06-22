/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Verdict.
 *
 * One violation the oracle reported, paired with the self-assessed
 * confidence, from zero to one, that it is real. Stands in for the
 * violation it wraps, mirroring the same rule and region so guards and
 * reports treat the two alike, yet renders its human line with the
 * confidence shown as a whole percentage beside the warning. Hands the
 * SARIF result straight to the wrapped violation, untouched.
 */
class Verdict {
  constructor(origin, score) {
    this.origin = origin;
    this.score = score;
    this.rule = origin.rule;
    this.spot = origin.spot;
  }
  text() {
    return `${this.origin.text()} (confidence ${Math.round(this.score * 100)}%)`;
  }
  sarif() {
    return this.origin.sarif();
  }
}

module.exports = Verdict;
