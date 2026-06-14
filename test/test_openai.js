/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const assert = require('assert');
const Openai = require('../src/openai');

const reply = (content, usage) => () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({choices: [{message: {content}}], usage})
});

describe('Openai', () => {
  it('returns the assistant message content from the reply', async () => {
    const chat = new Openai('secret-key', 'gpt-4o-mini', reply('pong', {}));
    assert.strictEqual(
      (await chat.answer('ping')).content,
      'pong',
      'the answer must carry the assistant message content'
    );
  });
  it('reports the token usage the reply carries', async () => {
    const chat = new Openai(
      'secret-key',
      'gpt-4o-mini',
      reply('pong', {prompt_tokens: 12, completion_tokens: 3})
    );
    assert.strictEqual(
      (await chat.answer('ping')).usage.sent,
      12,
      'the answer must carry the count of tokens sent'
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
