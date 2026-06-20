/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Command = require('../src/rules/command');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Command', () => {
  it('flags a line that opens with a pronoun', () => {
    const doc = new Markdown('x.md', '# Doors\nYou should shut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length,
      1,
      'a line opening with a pronoun must be flagged'
    );
  });
  it('accepts an imperative line', () => {
    const doc = new Markdown('x.md', '# Doors\nShut gate').document();
    assert.strictEqual(
      new Command().violations(doc).length,
      0,
      'an imperative line must pass'
    );
  });
});

describe('Command prompt', () => {
  it('tells the oracle a base-form imperative is a direct order', () => {
    assert.ok(
      new Command().prompt().includes('base-form imperative'),
      'the prompt must stop the oracle inverting bare imperatives into descriptions'
    );
  });
});

describe('Command suppress', () => {
  it('vetoes an oracle flag on a base-form imperative line', () => {
    const doc = new Markdown('x.md', '# Rules\nThrow exception on failure.').document();
    const flag = new Violation('command', 'warning', 'reads as a plain statement', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Command().suppress(flag, doc),
      true,
      'an oracle flag on a base-form imperative must be vetoed'
    );
  });
  it('keeps an oracle flag on a line that opens with a pronoun', () => {
    const doc = new Markdown('x.md', '# Rules\nYou should shut gate').document();
    const flag = new Violation('command', 'warning', 'reads as a description', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Command().suppress(flag, doc),
      false,
      'an oracle flag on a pronoun-opening line must survive'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# Rules\nThrow exception on failure.').document();
    const flag = new Violation('positive', 'warning', 'negative phrasing', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Command().suppress(flag, doc),
      false,
      'only a command flag may be vetoed by the command guard'
    );
  });
});
