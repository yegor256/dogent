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
 * violations paired with the token usage the model reported. Lets every
 * rule refine the parsed set, so a rule can veto an oracle flag the model
 * should never have raised. Mirrors a rule, but consults a model instead
 * of guessing.
 */
class Oracle {
  constructor(rules, chat) {
    this.rules = rules;
    this.chat = chat;
  }
  async violations(document) {
    const reply = await this.chat.answer(new Prompt(this.rules, document).text());
    const raw = new Answer(reply.content).violations();
    return {
      found: this.rules
        .filter((rule) => rule.refine)
        .reduce((kept, rule) => rule.refine(kept, document), raw),
      usage: reply.usage
    };
  }
}

module.exports = Oracle;
