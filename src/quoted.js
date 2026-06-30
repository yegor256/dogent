/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Quoted.
 *
 * Tells whether the word at a given column sits inside a described
 * position rather than inside an instruction the agent must act on. A
 * report verb followed by "that" — "argue that ...", "explain that ..."
 * — quotes a thesis, and a qualifier or quantity inside that thesis
 * names the subject matter, not a threshold the agent is asked to hit.
 * A vague or quantifier rule should leave such a word alone. Only a word
 * that falls after such a clause counts as quoted.
 */
const verbs = 'argue|argues|claim|claims|explain|explains|describe|' +
  'describes|cover|covers|teach|teaches|discuss|discusses|show|shows|' +
  'prove|proves|defend|defends';

const quoted = (masked, index) => {
  const regex = new RegExp(`\\b(?:${verbs})\\s+that\\b`, 'giu');
  let hit = regex.exec(masked);
  while (hit !== null) {
    if (hit.index + hit[0].length <= index) {
      return true;
    }
    hit = regex.exec(masked);
  }
  return false;
};

module.exports = quoted;
