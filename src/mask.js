/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Mask.
 *
 * Blanks out inline-code spans inside a prose line so word-scanning
 * rules never match quoted examples or filename templates. Backtick
 * runs are consumed in full and paired when a later run carries the
 * same length, so a double-backtick span hides its inner backticks
 * too. The whole matched span becomes equal-length spaces, keeping
 * every column offset intact for the violations that survive, while
 * unmatched runs stay visible.
 */

/**
 * Finds every maximal backtick run in the line.
 *
 * @param {string} text Prose line to scan
 * @return {Array<{at: number, to: number, length: number}>} Backtick runs
 */
const delimiters = (text) => Array.from(text.matchAll(/`+/gu), (found) => ({at: found.index, to: found.index + found[0].length, length: found[0].length}));

/**
 * Finds the first run after the opener with the same length.
 *
 * @param {Array<{at: number, to: number, length: number}>} runs Backtick runs
 * @param {{at: number, to: number, length: number}} opener Run to pair
 * @param {number} from Index to start the search after
 * @return {number} Index of the matching run, or -1 when none
 */
const partner = (runs, opener, from) => {
  for (let at = from; at < runs.length; at += 1) {
    if (runs[at].length === opener.length) {
      return at;
    }
  }
  return -1;
};

/**
 * Pairs each run with a later run of the same length.
 *
 * @param {Array<{at: number, to: number, length: number}>} runs Backtick runs
 * @return {Array<Array<number>>} Whole-span [start, end) ranges
 */
const spans = (runs) => {
  const pairs = [];
  let cursor = 0;
  while (cursor < runs.length) {
    const opener = runs[cursor];
    const closer = partner(runs, opener, cursor + 1);
    if (closer < 0) {
      cursor += 1;
    } else {
      pairs.push([opener.at, runs[closer].to]);
      cursor = closer + 1;
    }
  }
  return pairs;
};

/**
 * Blanks the given ranges with spaces.
 *
 * @param {string} text Prose line to blank
 * @param {Array<Array<number>>} pairs Whole-span [start, end) ranges
 * @return {string} Line with spans turned into equal-length spaces
 */
const blank = (text, pairs) => {
  const chars = text.split('');
  pairs.forEach(([from, to]) => chars.fill(' ', from, to));
  return chars.join('');
};

/**
 * Masks inline-code spans, double-backtick ones included.
 *
 * @param {string} text Prose line to mask
 * @return {string} Line with every code span hidden as spaces
 */
const mask = (text) => blank(text, spans(delimiters(text)));

module.exports = mask;
