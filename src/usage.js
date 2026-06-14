/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Price table.
 *
 * United States dollars per one million tokens, sent and received, for
 * every model dogent knows. An unknown model falls back to zero, so the
 * summary still prints token counts without inventing a price.
 */
const PRICES = {
  'gpt-4o-mini': {input: 0.15, output: 0.6},
  'gpt-4o': {input: 2.5, output: 10},
  'gpt-4.1-nano': {input: 0.1, output: 0.4},
  'gpt-4.1-mini': {input: 0.4, output: 1.6},
  'gpt-4.1': {input: 2, output: 8}
};

/**
 * Usage.
 *
 * One immutable tally of an OpenAI exchange: the model, the tokens sent,
 * and the tokens received. Sums itself with another tally and renders a
 * single human summary line, complete with an estimated dollar cost.
 */
class Usage {
  constructor(model, sent, received) {
    this.model = model;
    this.sent = sent;
    this.received = received;
  }
  plus(other) {
    return new Usage(
      this.model || other.model,
      this.sent + other.sent,
      this.received + other.received
    );
  }
  cost() {
    const price = PRICES[this.model] || {input: 0, output: 0};
    return this.sent / 1e6 * price.input + this.received / 1e6 * price.output;
  }
  text() {
    return `OpenAI: ${this.model}, ${this.sent} sent, ${this.received} received, ~$${this.cost().toFixed(4)}`;
  }
}

module.exports = Usage;
