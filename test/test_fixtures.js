/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

const run = (file) => spawnSync(
  'node',
  [path.join(__dirname, '../src/dogent.js'), file],
  {encoding: 'utf8', env: {...process.env}}
);

const fixtures = (kind) => {
  const dir = path.join(__dirname, 'fixtures', kind);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(dir, name));
};

(process.env.OPENAI_API_KEY ? describe : describe.skip)('fixtures', () => {
  fixtures('positive').forEach((file) => {
    it(`stays silent through the model for ${path.basename(file)}`, () => {
      assert.ok(
        /0 problems found/u.test(run(file).stdout),
        'a clean manifesto must survive the oracle with zero problems'
      );
    });
  });
  fixtures('negative').forEach((file) => {
    it(`lets the oracle catch the flaw in ${path.basename(file)}`, () => {
      assert.notStrictEqual(
        run(file).status,
        0,
        'a manifesto the rules miss must still make the oracle exit non-zero'
      );
    });
  });
});
