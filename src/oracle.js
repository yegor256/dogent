/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Prompt = require('./prompt');
const Answer = require('./answer');
const Usage = require('./usage');
const Log = require('./log');
const prettyMs = require('pretty-ms');

const SAMPLES = 5;
const AGREEMENT = 4;

const absorb = (tally, run) => {
  const seen = new Set();
  run.forEach((verdict) => {
    const key = verdict.spot.line();
    const prior = tally.get(key);
    tally.set(key, {
      count: (prior ? prior.count : 0) + (seen.has(key) ? 0 : 1),
      best: prior && prior.best.score >= verdict.score ? prior.best : verdict
    });
    seen.add(key);
  });
};

/**
 * Oracle.
 *
 * The AI second opinion. Wraps a chat endpoint and a log, builds one
 * prompt from a document, logs that prompt through debug, and asks the
 * endpoint not once but several times, since the same model at
 * temperature zero still answers differently run to run. Keeps only a
 * contradiction that recurs in a super-majority of the samples — by
 * default four of five — so a finding that flaps in and out across runs,
 * or whose per-sample odds hover near half, falls below the bar and is
 * discarded, biasing an uncertain claim toward silence. Pairs the kept
 * findings with the summed token usage the model reported. Reads the
 * whole manifesto and names where it contradicts itself, knowing nothing
 * of the deterministic rules.
 */
class Oracle {
  constructor(chat, log = new Log(false), samples = SAMPLES, agreement = AGREEMENT) {
    this.chat = chat;
    this.log = log;
    this.samples = samples;
    this.agreement = agreement;
  }
  async violations(document) {
    const prompt = new Prompt(document).text();
    this.announce(prompt);
    const clock = Date.now();
    const replies = await Promise.all(
      Array.from({length: this.samples}, () => this.chat.answer(prompt))
    );
    const runs = replies.map((reply) => new Answer(reply.content).violations());
    const usage = replies.reduce((acc, reply) => acc.plus(reply.usage), new Usage('', 0, 0));
    const found = this.agree(runs);
    this.summarise(usage, runs, found, Date.now() - clock);
    return {found, usage};
  }
  agree(runs) {
    const bar = Math.min(this.agreement, this.samples);
    const tally = new Map();
    runs.forEach((run) => absorb(tally, run));
    return [...tally.values()]
      .filter((cell) => cell.count >= bar)
      .map((cell) => cell.best);
  }
  announce(prompt) {
    const rows = prompt.split('\n');
    this.log.debug(
      `Sending this prompt (${rows.length} lines, ${prompt.length} symbols) ` +
      `to OpenAI ${this.samples} times:\n${rows.map((row) => `  ${row}`).join('\n')}`
    );
  }
  summarise(usage, runs, found, millis) {
    const reported = runs.reduce((sum, run) => sum + run.length, 0);
    this.log.debug(
      `${usage.text(reported, found.length)}, ` +
      `analysed in ${prettyMs(millis)} across ${this.samples} samples`
    );
  }
}

module.exports = Oracle;
