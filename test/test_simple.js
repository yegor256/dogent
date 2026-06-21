/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const Simple = require('../src/rules/simple');
const Violation = require('../src/violation');
const Region = require('../src/region');

describe('Simple', () => {
  it('flags a tangled multi-clause line', () => {
    const doc = new Markdown('x.md', '# H\nIf the input is valid, and no error occurred, then emit the result, unless verbose.').document();
    assert.strictEqual(new Simple().violations(doc).length, 1, 'a tangled multi-clause line must be flagged');
  });
  it('accepts a short imperative line', () => {
    const doc = new Markdown('x.md', '# H\nValidate the input.').document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'a short imperative line must pass'
    );
  });
  it('accepts one conjunction with one comma', () => {
    const doc = new Markdown(
      'x.md',
      '# H\nRun standalone by default, call AI only when token exists.'
    ).document();
    assert.strictEqual(
      new Simple().violations(doc).length,
      0,
      'one conjunction with one comma must stay below threshold'
    );
  });
  it('accepts a comma-separated list carrying no conjunction', () => {
    const doc = new Markdown('x.md', '# H\nDo not run build, tests, linters, or static analysis.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a plain list must not count as multi-clause');
  });
  it('accepts a coordinated list inside a single when clause', () => {
    const doc = new Markdown('x.md', '# H\nStop when text is missing, empty, or only whitespace.').document();
    assert.strictEqual(new Simple().violations(doc).length, 0, 'a list inside one clause must not count as tangled');
  });
});

describe('Simple prompt', () => {
  it('exposes its id in the prompt', () => {
    assert.ok(
      new Simple().prompt().includes('simple'),
      'the prompt must mention the rule id'
    );
  });
  it('directs the oracle to weigh clause depth', () => {
    assert.ok(
      new Simple().prompt().includes('clause depth'),
      'the prompt must hand true clause-depth analysis to the oracle'
    );
  });
  it('tells the oracle an Oxford-comma object list is not tangled', () => {
    assert.ok(
      new Simple().prompt().includes('Oxford-comma list'),
      'the prompt must spare a leading imperative trailed by an Oxford-comma object list'
    );
  });
  it('warns the oracle that a list item may embed its own verb', () => {
    assert.ok(
      new Simple().prompt().includes('embeds its own verb'),
      'the prompt must clear a list item that embeds a finite verb'
    );
  });
  it('shows the oracle the coordinated-object example', () => {
    assert.ok(
      new Simple().prompt().includes('why it is wrong'),
      'the prompt must carry the coordinated-object example'
    );
  });
});

describe('Simple suppress', () => {
  it('vetoes an oracle flag on a line with no comma and no conjunction', () => {
    const doc = new Markdown('x.md', '# H\nWrite like human.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'a line without comma or conjunction cannot be tangled'
    );
  });
  it('keeps an oracle flag on a line carrying a comma', () => {
    const doc = new Markdown('x.md', '# H\nEmit the result, then halt.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a comma leaves room for genuine tangle'
    );
  });
  it('ignores an oracle flag raised by another rule', () => {
    const doc = new Markdown('x.md', '# H\nWrite like human.').document();
    const flag = new Violation('command', 'warning', 'reads as a statement', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'only a simple flag may be vetoed by the simple guard'
    );
  });
});

describe('Simple lone guard', () => {
  it('vetoes an oracle flag on a lone when guard with no comma', () => {
    const doc = new Markdown('x.md', '# H\nEmit the result when input is valid.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'a lone do X when Y guard holds one clause and cannot be tangled'
    );
  });
  it('keeps an oracle flag on a line carrying a second conjunction', () => {
    const doc = new Markdown('x.md', '# H\nEmit the result when input is valid unless verbose.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a second conjunction leaves room for genuine tangle'
    );
  });
  it('keeps an oracle flag on a conjunction carrying a clause comma', () => {
    const doc = new Markdown('x.md', '# H\nWhen input is valid, emit the result.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a conjunction with a clause comma leaves room for genuine tangle'
    );
  });
});

describe('Simple coordinated object', () => {
  it('vetoes an oracle flag on an Oxford-comma object list closed by and', () => {
    const doc = new Markdown('x.md', '# H\nCover bug, why it is wrong, and proposed fix.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'a leading imperative taking a coordinated three-part object is not tangled'
    );
  });
  it('vetoes an oracle flag on a comma list closed by and', () => {
    const doc = new Markdown('x.md', '# H\nMirror its title shape, structure, and tone.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'a leading imperative taking a comma-listed object is not tangled'
    );
  });
  it('keeps an oracle flag when and welds a verb taking its own object', () => {
    const doc = new Markdown('x.md', '# H\nCover the bug, and rewrite the patch.').document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('x.md', 2, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      false,
      'a second verb taking a determiner-led object must survive'
    );
  });
});

describe('Simple frontmatter', () => {
  it('vetoes an oracle flag on the frontmatter description', () => {
    const doc = new Markdown(
      'SKILL.md', '---\nname: g\ndescription: |\n  Reads tables, writes a report, and pings the owner in one comment.\n---\n# H\nDo it.'
    ).document();
    const flag = new Violation('simple', 'warning', 'grammatically tangled', new Region('SKILL.md', 4, 1));
    assert.strictEqual(
      new Simple().suppress(flag, doc),
      true,
      'an oracle flag inside the frontmatter description must be vetoed'
    );
  });
  it('tells the oracle to spare the frontmatter description', () => {
    assert.ok(
      new Simple().prompt().includes('frontmatter'),
      'the prompt must exempt the frontmatter description from the tangle check'
    );
  });
});
