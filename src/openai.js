/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Usage = require('./usage');

/**
 * Openai.
 *
 * A thin adapter over an OpenAI-compatible chat-completions endpoint.
 * Sends one prompt, demands a JSON object back, and returns the assistant
 * text paired with a Usage tally of the model and the tokens it consumed.
 * The base URL is configurable, so the same adapter reaches OpenAI itself
 * or any compatible server, such as vLLM, Ollama, or a private gateway.
 * The transport is injected so the class runs in tests without a socket.
 */
class Openai {
  constructor(key, model, base, transport) {
    this.key = key;
    this.model = model;
    this.base = base;
    this.transport = transport;
  }
  async answer(prompt) {
    const response = await this.transport(
      `${this.base.replace(/\/+$/u, '')}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.key}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: {type: 'json_object'},
          messages: [{role: 'user', content: prompt}]
        })
      }
    );
    if (!response.ok) {
      throw new Error(`OpenAI request rejected with status ${response.status}`);
    }
    const body = await response.json();
    const usage = body.usage || {};
    return {
      content: body.choices[0].message.content,
      usage: new Usage(
        this.model,
        usage.prompt_tokens || 0,
        usage.completion_tokens || 0
      )
    };
  }
}

module.exports = Openai;
