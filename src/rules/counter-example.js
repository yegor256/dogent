/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

/**
 * CounterExample.
 *
 * Rejects "bad example" demonstrations that show the wrong form, since
 * displaying a mistake can reinforce it. A standalone checker flags a
 * line that opens a counterexample with an introducer phrase ("bad
 * example", "wrong example", "for example, do not", "instead of
 * writing", "avoid writing") and then carries a quoted or backticked
 * sample of the wrong form.
 */
class CounterExample {
  constructor() {
    this.id = 'counter-example';
  }
  hint() {
    return 'Remove the demonstration of the wrong form and show only the correct form, since displaying a mistake can teach the agent to repeat it.';
  }
  violations(document) {
    const uri = document.uri();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.scan(text, line, uri),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, uri) {
    const regex = /bad example|wrong example|for example, do not|instead of writing|avoid writing/iu;
    const hit = regex.exec(mask(text));
    if (hit === null) {
      return [];
    }
    const tail = text.slice(hit.index + hit[0].length);
    if (!/["'`]/u.test(tail)) {
      return [];
    }
    return [new Violation(
      this.id,
      'warning',
      'counterexample may reinforce the wrong behavior, show the right form',
      new Region(uri, line, hit.index + 1)
    )];
  }
}

module.exports = CounterExample;
