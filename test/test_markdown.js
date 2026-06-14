/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Markdown = require('../src/markdown');

describe('Markdown', () => {
  it('parses a lone header into one header piece', () => {
    const pieces = new Markdown('x.md', '# Tools').document().walk({
      header: () => ['header'],
      prose: () => ['prose'],
      snippet: () => ['snippet'],
      bullets: () => []
    });
    assert.deepStrictEqual(
      pieces, ['header'], 'a single header line must produce one header piece'
    );
  });
  it('parses a fenced block into one snippet piece', () => {
    const pieces = new Markdown('x.md', '```bash\nls -la\npwd\n```').document().walk({
      header: () => ['header'],
      prose: () => ['prose'],
      snippet: () => ['snippet'],
      bullets: () => []
    });
    assert.deepStrictEqual(
      pieces, ['snippet'], 'a fenced block must collapse into one snippet piece'
    );
  });
  it('collapses consecutive bullets into one bullets piece', () => {
    const pieces = new Markdown('x.md', '- alpha\n- beta\n- gamma').document().walk({
      header: () => [], prose: () => [], snippet: () => [], bullets: () => ['bullets']
    });
    assert.deepStrictEqual(
      pieces, ['bullets'], 'three dashes in a row must produce one bullets piece'
    );
  });
  it('keeps each bullet as its own inner prose piece', () => {
    const items = new Markdown('x.md', '- alpha\n- beta\n- gamma').document().walk({
      header: () => [], prose: () => ['item'], snippet: () => [], bullets: () => []
    });
    assert.strictEqual(items.length, 3, 'each bullet line must become its own inner prose piece');
  });
  it('keeps two prose lines as two pieces', () => {
    const pieces = new Markdown('x.md', 'Close door\nLock gate').document().walk({
      header: () => [], prose: () => ['prose'], snippet: () => [], bullets: () => []
    });
    assert.strictEqual(pieces.length, 2, 'two prose lines must produce two prose pieces');
  });
  it('tracks the line number of a header', () => {
    const rows = new Markdown('x.md', '\n\n# Late').document().walk({
      header: (text, line) => [line], prose: () => [], snippet: () => [], bullets: () => []
    });
    assert.deepStrictEqual(rows, [3], 'a header on the third line must report line three');
  });
});

describe('Markdown line endings', () => {
  it('strips trailing carriage returns from CRLF prose', () => {
    const texts = new Markdown('x.md', 'Close door\r\nLock gate\r\n').document().walk({
      header: () => [], prose: (text) => [text], snippet: () => [], bullets: () => []
    });
    assert.ok(texts.every((text) => !text.includes('\r')), 'CRLF must not leave a carriage return');
  });
});
