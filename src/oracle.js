/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Prompt = require('./prompt');
const Answer = require('./answer');

/**
 * Oracle.
 *
 * The AI second opinion. Wraps the rules and a chat endpoint, builds one
 * prompt from a document, asks the endpoint, and parses the reply into
 * violations paired with the token usage the model reported. Mirrors a
 * rule, but consults a model instead of guessing.
 */
class Oracle {
  constructor(rules, chat) {
    this.rules = rules;
    this.chat = chat;
  }
  async violations(document) {
    const reply = await this.chat.answer(new Prompt(this.rules, document).text());
    return {
      found: new Answer(reply.content).violations(),
      usage: reply.usage
    };
  }
}

module.exports = Oracle;
