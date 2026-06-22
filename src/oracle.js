/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Prompt = require('./prompt');
const Answer = require('./answer');
const Log = require('./log');

/**
 * Oracle.
 *
 * The AI second opinion. Wraps the rules, a chat endpoint, and a log,
 * builds one prompt from a document, logs that prompt through debug,
 * asks the endpoint, and parses the reply into violations paired with
 * the token usage the model reported. Mirrors a rule, but consults a
 * model instead of guessing. Lets each rule veto an oracle flag it
 * knows to be false, so a deterministic guard overrides the model.
 */
class Oracle {
  constructor(rules, chat, log = new Log(false)) {
    this.rules = rules;
    this.chat = chat;
    this.log = log;
  }
  async violations(document) {
    const prompt = new Prompt(this.rules, document).text();
    this.log.debug(prompt);
    const reply = await this.chat.answer(prompt);
    return {
      found: new Answer(reply.content).violations().filter(
        (violation) => !this.rules.some(
          (rule) => rule.suppress?.(violation, document)
        )
      ),
      usage: reply.usage
    };
  }
}

module.exports = Oracle;
