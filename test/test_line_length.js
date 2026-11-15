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
describe('LineLength with non-BMP symbols', () => {
  it('accepts a line at the cap that ends with a non-BMP symbol', () => {
    const doc = new Markdown(
      'x.md', `${'a'.repeat(79)}\u{10400}`
    ).document();
    assert.strictEqual(
      new LineLength(80).violations(doc).length,
      0,
      'a surrogate pair must count as one symbol, not two'
    );
  });
  it('accepts a heading at the cap with a non-BMP symbol', () => {
    const doc = new Markdown(
      'x.md', `# ${'a'.repeat(77)}\u{10400}`
    ).document();
    assert.strictEqual(
      new LineLength(80).violations(doc).length,
      0,
      'a heading of 80 symbols with a surrogate pair must stay within the limit'
    );
  });
  it('accepts a bullet at the cap with a non-BMP symbol', () => {
    const doc = new Markdown(
      'x.md', `- ${'a'.repeat(77)}\u{10400}`
    ).document();
    assert.strictEqual(
      new LineLength(80).violations(doc).length,
      0,
      'a bullet of 80 symbols with a surrogate pair must stay within the limit'
    );
  });
  it('still flags a non-BMP line that goes over the cap', () => {
    const doc = new Markdown(
      'x.md', `${'a'.repeat(80)}\u{10400}`
    ).document();
    const found = new LineLength(80).violations(doc);
    assert.strictEqual(
      found.length,
      1,
      'an 81-symbol line with a surrogate pair must raise one violation'
    );
    assert.match(
      found[0].text(),
      /has 81$/u,
      'the message must count each symbol once, surrogate pairs included'
    );
  });
});
