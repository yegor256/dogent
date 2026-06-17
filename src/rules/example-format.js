/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Example format.
 *
 * A few-shot demonstration regulates the shape of the output more
 * strongly than any prose, so an example that disagrees with the
 * declared format teaches the agent the wrong shape. This rule ties the
 * `example` and `format` rules together by checking their consistency:
 * when one SKILL.md both shows an example and declares an output format,
 * the two must agree. The mismatch hides between two distant fragments,
 * so this check is pure judgement: prompt() hands the comparison to the
 * AI oracle and violations() finds nothing on its own.
 */
class ExampleFormat {
  constructor() {
    this.id = 'example-format';
  }
  prompt() {
    return `${this.id}: in a SKILL.md that both shows an example and declares an output format, judge whether the example conforms to the declared format and flag any mismatch`;
  }
  violations() {
    return [];
  }
}

module.exports = ExampleFormat;
