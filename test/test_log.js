/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Log = require('../src/log');

const sink = () => ({
  lines: [],
  write(line) {
    this.lines.push(line);
  }
});

describe('Log', () => {
  it('writes an info line to its output stream', () => {
    const out = sink();
    new Log(false, out, sink()).info('done');
    assert.deepStrictEqual(
      out.lines,
      ['done\n'],
      'an info line must reach the output stream'
    );
  });
  it('writes a debug line to its error stream when verbose', () => {
    const err = sink();
    new Log(true, sink(), err, (note) => note).debug('scan');
    assert.deepStrictEqual(
      err.lines,
      ['scan\n'],
      'a verbose run must send debug notes to the error stream'
    );
  });
  it('paints debug notes through its colorizer', () => {
    const err = sink();
    new Log(true, sink(), err, (note) => `gray(${note})`).debug('scan');
    assert.deepStrictEqual(
      err.lines,
      ['gray(scan)\n'],
      'a debug note must pass through the colorizer before printing'
    );
  });
  it('drops a debug line when not verbose', () => {
    const err = sink();
    new Log(false, sink(), err).debug('scan');
    assert.deepStrictEqual(
      err.lines,
      [],
      'a debug note cannot appear unless verbose is on'
    );
  });
  it('keeps debug notes off the output stream', () => {
    const out = sink();
    new Log(true, out, sink()).debug('scan');
    assert.deepStrictEqual(
      out.lines,
      [],
      'a debug note cannot leak into the result stream'
    );
  });
});

describe('Log error', () => {
  it('writes an error line to its error stream without verbose', () => {
    const err = sink();
    new Log(false, sink(), err).error('boom');
    assert.deepStrictEqual(
      err.lines,
      ['boom\n'],
      'an error line cannot stay hidden when verbose is off'
    );
  });
  it('keeps error lines off the output stream', () => {
    const out = sink();
    new Log(false, out, sink()).error('boom');
    assert.deepStrictEqual(
      out.lines,
      [],
      'an error line cannot leak into the result stream'
    );
  });
});
