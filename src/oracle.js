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
 * violations. Mirrors a rule, but consults a model instead of guessing.
 */
class Oracle {
  constructor(rules, chat) {
    this.rules = rules;
    this.chat = chat;
  }
  async violations(document) {
    return new Answer(
      await this.chat.answer(new Prompt(this.rules, document).text())
    ).violations();
  }
}

module.exports = Oracle;
