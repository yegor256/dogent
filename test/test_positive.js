/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Positive = require('../src/rules/positive');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Positive', () => {
  it('flags a do-not line', () => {
    const doc = new Markdown('x.md', '# H\nDo not use mock data.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "do not" line must be flagged'
    );
  });
  it('flags a never line', () => {
    const doc = new Markdown('x.md', '# H\nNever edit the lockfile.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "never" line must be flagged'
    );
  });
  it('flags a contracted do-not line', () => {
    const doc = new Markdown('x.md', "# H\nDon't touch the cache.").document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a "don\'t" line must be flagged'
    );
  });
  it('flags a banned bullet item', () => {
    const doc = new Markdown('x.md', '# H\n- Avoid global state.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      1,
      'a bullet whose head is a ban must be flagged'
    );
  });
});

describe('Positive acceptance', () => {
  it('accepts a positive imperative', () => {
    const doc = new Markdown('x.md', '# H\nOnly use real data.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a positive imperative line must pass'
    );
  });
  it('accepts a ban word used mid-line as a modifier', () => {
    const doc = new Markdown('x.md', '# H\nRead manifesto line by line, never through grammar.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a non-head ban word must not be flagged'
    );
  });
  it('ignores a ban hidden inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n`do not` stands as a token.').document();
    assert.strictEqual(
      new Positive().violations(doc).length,
      0,
      'a keyword inside inline code must not be flagged'
    );
  });
});

describe('Positive suppress', () => {
  const flag = (line) => new Violation(
    'positive',
    'warning',
    'Rewrite as a positive imperative',
    new Region('x.md', line, 1)
  );
  it('vetoes an oracle flag on an affirmative imperative', () => {
    const doc = new Markdown(
      'x.md', '# Errors\n\nThrow exception immediately when anything goes wrong.'
    ).document();
    assert.strictEqual(
      new Positive().suppress(flag(3), doc),
      true,
      'a flag on a line with no negation token must be vetoed'
    );
  });
  it('keeps an oracle flag on a line carrying a negation token', () => {
    const doc = new Markdown('x.md', '# H\n\nLeave no comment in the diff.').document();
    assert.strictEqual(
      new Positive().suppress(flag(3), doc),
      false,
      'a flag on a line with a real negation must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# H\n\nReturn value from method.').document();
    const other = new Violation(
      'command', 'warning', 'sounds like a question', new Region('x.md', 3, 1)
    );
    assert.strictEqual(
      new Positive().suppress(other, doc),
      false,
      'only a positive flag may be vetoed by the positive guard'
    );
  });
  it('ignores a negation token hidden inside a code span', () => {
    const doc = new Markdown('x.md', '# H\n\nReturn `not` from method.').document();
    assert.strictEqual(
      new Positive().suppress(flag(3), doc),
      true,
      'a negation token inside inline code must not rescue the flag'
    );
  });
});

describe('Positive prompt', () => {
  it('exposes its id through the prompt', () => {
    assert.ok(
      new Positive().prompt().includes('positive'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to rewrite bans as positive imperatives', () => {
    assert.ok(
      new Positive().prompt().includes('positive imperative'),
      'the prompt must hand subtler bans to the oracle'
    );
  });
  it('requires an actual negation before flagging', () => {
    assert.ok(
      new Positive().prompt().includes('negates'),
      'the prompt must demand a real negation, not just any imperative'
    );
  });
  it('spares an affirmative imperative', () => {
    assert.ok(
      new Positive().prompt().includes('affirmative imperative'),
      'the prompt must leave a line that already states what to do alone'
    );
  });
});
