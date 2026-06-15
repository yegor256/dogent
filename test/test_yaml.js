/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Yaml = require('../src/yaml');

describe('Yaml', () => {
  it('parses a flat key into one pair', () => {
    const pairs = new Yaml('name: shut-gate', 2).pairs();
    assert.strictEqual(pairs[0].key, 'name', 'a "key: value" line must yield that key');
  });
  it('reads the value of a key', () => {
    const pairs = new Yaml('description: Shut gate', 2).pairs();
    assert.strictEqual(pairs[0].value, 'Shut gate', 'the text after the colon must be the value');
  });
  it('tracks the absolute line of a key', () => {
    const pairs = new Yaml('name: shut-gate\ndescription: Shut gate', 2).pairs();
    assert.strictEqual(pairs[1].row, 3, 'the second key must report its absolute line');
  });
  it('holds no pair for a comment line', () => {
    const pairs = new Yaml('# just a note', 2).pairs();
    assert.strictEqual(pairs.length, 0, 'a comment line must yield no pair');
  });
  it('folds a literal block scalar into the value', () => {
    const pairs = new Yaml('description: |\n  Shut the gate\n  when it rains', 2).pairs();
    assert.strictEqual(pairs[0].value, 'Shut the gate when it rains', 'a "|" block must fold its lines into the value');
  });
  it('folds a folded block scalar into the value', () => {
    const pairs = new Yaml('description: >\n  Shut the gate', 2).pairs();
    assert.strictEqual(pairs[0].value, 'Shut the gate', 'a ">" block must fold its lines into the value');
  });
  it('keeps the key row of a block scalar', () => {
    const pairs = new Yaml('description: |\n  Shut the gate', 2).pairs();
    assert.strictEqual(pairs[0].row, 2, 'a block scalar must report the row of its key');
  });
  it('stops folding a block scalar at the next key', () => {
    const pairs = new Yaml('description: |\n  Shut the gate\nname: shut-gate', 2).pairs();
    assert.strictEqual(pairs[1].key, 'name', 'a top-level key must end the block scalar');
  });
});
