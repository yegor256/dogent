/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Openai = require('../src/openai');

describe('Openai', () => {
  it('returns the assistant message content from the reply', async () => {
    const chat = new Openai('secret-key', 'gpt-4o-mini', () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({choices: [{message: {content: 'pong'}}]})
    }));
    assert.strictEqual(
      await chat.answer('ping'),
      'pong',
      'the answer must be the assistant message content'
    );
  });
  it('fails fast when the endpoint rejects the request', async () => {
    const chat = new Openai('secret-key', 'gpt-4o-mini', () => Promise.resolve({
      ok: false,
      status: 429,
      text: () => Promise.resolve('slow down')
    }));
    await assert.rejects(
      chat.answer('ping'),
      'a non-ok response must reject instead of returning silence'
    );
  });
});
