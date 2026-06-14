/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');
const LineLength = require('../src/rules/line-length');

describe('LineLength', () => {
  it('flags a line wider than the limit', () => {
    const doc = new Markdown('x.md', `# H\n${'z'.repeat(90)}`).document();
    assert.strictEqual(
      new LineLength(80).violations(doc).length,
      1,
      'a 90-symbol line must raise exactly one length violation'
    );
  });
  it('accepts lines within the limit', () => {
    const doc = new Markdown('x.md', '# H\nShut gate quietly').document();
    assert.strictEqual(
      new LineLength(80).violations(doc).length,
      0,
      'lines within the limit must raise no violation'
    );
  });
  it('points the violation one column past the limit', () => {
    const doc = new Markdown('x.md', 'y'.repeat(85)).document();
    assert.strictEqual(
      new LineLength(80).violations(doc)[0]
        .sarif().locations[0].physicalLocation.region.startColumn,
      81,
      'the violation must point one column past the limit'
    );
  });
});

describe('LineLength prompt', () => {
  it('offers no fragment so the oracle never re-checks it', () => {
    assert.strictEqual(
      new LineLength(80).prompt(),
      '',
      'the line-length rule stays deterministic and out of the oracle'
    );
  });
});
