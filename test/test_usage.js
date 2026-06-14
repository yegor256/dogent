/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Usage = require('../src/usage');

describe('Usage', () => {
  it('adds the tokens of another tally', () => {
    assert.strictEqual(
      new Usage('gpt-4o-mini', 100, 20).plus(new Usage('gpt-4o-mini', 50, 5)).sent,
      150,
      'two tallies must add their sent tokens together'
    );
  });
  it('keeps the model name when adding to an empty tally', () => {
    assert.strictEqual(
      new Usage('', 0, 0).plus(new Usage('gpt-4o-mini', 1, 1)).model,
      'gpt-4o-mini',
      'an empty tally must inherit the model of the one added to it'
    );
  });
  it('estimates cost from the per-model price table', () => {
    assert.strictEqual(
      new Usage('gpt-4o-mini', 1000000, 1000000).cost(),
      0.75,
      'cost must follow the per-model input and output prices'
    );
  });
  it('charges nothing for a model absent from the price table', () => {
    assert.strictEqual(
      new Usage('mystery-model', 1000000, 1000000).cost(),
      0,
      'an unknown model must cost zero rather than invent a price'
    );
  });
  it('renders a one-line summary of the exchange', () => {
    assert.strictEqual(
      new Usage('gpt-4o-mini', 1234, 567).text(),
      'OpenAI: gpt-4o-mini, 1234 sent, 567 received, ~0.05¢',
      'the summary must name the model, the tokens, and the cost'
    );
  });
});
