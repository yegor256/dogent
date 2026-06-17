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

const capture = (box) => (url) => {
  box.url = url;
  return reply('pong', {})();
};

describe('Openai', () => {
  it('returns the assistant message content from the reply', async () => {
    const chat = new Openai(
      'secret-key',
      'gpt-4o-mini',
      'https://api.openai.com/v1',
      reply('pong', {})
    );
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
      'https://api.openai.com/v1',
      reply('pong', {prompt_tokens: 12, completion_tokens: 3})
    );
    assert.strictEqual(
      (await chat.answer('ping')).usage.sent,
      12,
      'the answer must carry the count of tokens sent'
    );
  });
  it('fails fast when the endpoint rejects the request', async () => {
    const chat = new Openai(
      'secret-key',
      'gpt-4o-mini',
      'https://api.openai.com/v1',
      () => Promise.resolve({ok: false, status: 429})
    );
    await assert.rejects(
      chat.answer('ping'),
      'a non-ok response must reject instead of returning silence'
    );
  });
});

describe('Openai endpoint', () => {
  it('targets the chat-completions path beneath the configured base URL', async () => {
    const box = {};
    await new Openai(
      'secret-key', 'gpt-4o-mini', 'http://localhost:8000/v1', capture(box)
    ).answer('ping');
    assert.strictEqual(
      box.url,
      'http://localhost:8000/v1/chat/completions',
      'the request must reach the configured base URL, not the hardcoded OpenAI host'
    );
  });
  it('trims a trailing slash from the configured base URL', async () => {
    const box = {};
    await new Openai(
      'secret-key', 'gpt-4o-mini', 'http://localhost:8000/v1/', capture(box)
    ).answer('ping');
    assert.strictEqual(
      box.url,
      'http://localhost:8000/v1/chat/completions',
      'a trailing slash must not double up against the endpoint path'
    );
  });
});
