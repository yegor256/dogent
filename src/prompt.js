/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Prompt.
 *
 * The full request handed to the AI oracle, laid out as a Markdown
 * document: a Task section fixing the role and reply shape, and a
 * Manifesto section fencing the file under review with every line
 * numbered so the oracle can cite an exact row. The oracle is asked
 * for one thing only, to read the whole file and name where it
 * contradicts itself, or to stay silent.
 */
class Prompt {
  constructor(document) {
    this.doc = document;
  }
  text() {
    return [this.task(), this.manifesto()].join('\n\n');
  }
  task() {
    const uri = this.doc.uri();
    return [
      '# Task',
      '',
      'You are reviewing an AI-agent manifesto.',
      '',
      `The file under review is "${uri}".`,
      'It is a list of terse imperative instructions, grouped under headings.',
      '',
      'Read the whole file and find where it contradicts itself:',
      'one line demanding the opposite of another, a rule one section',
      'sets and another breaks, guidance that cannot all hold at once.',
      '',
      'Report only clear, important inconsistencies.',
      'Most manifestos are consistent.',
      'An empty result list is the normal, expected reply.',
      'When you find no real contradiction, report nothing and return {"results": []}.',
      'Never invent an inconsistency to seem useful.',
      'Report one only when you are certain two lines clash.',
      '',
      'The results array holds contradictions only.',
      'Never add a result that states no contradiction exists.',
      'Absence of a contradiction is an empty array, never a result describing it.',
      'Every result must name two specific clashing lines.',
      '',
      'Every result must carry a "confidence" number from 0 to 1.',
      'This is your own probability that the inconsistency is real.',
      'A result without a confidence is discarded, so always include one.',
      'When unsure, lower the confidence, never guess.',
      '',
      'Reply with one JSON object and nothing else, shaped as {"results":[ ... ]}.',
      'Each JSON object item is a SARIF result with keys ruleId, level "warning", message.text, confidence, and locations.',
      'Set ruleId to "inconsistency" and startLine to one of the two clashing line numbers.',
      `The locations[0].physicalLocation must carry artifactLocation.uri "${uri}" and region.startColumn 1.`,
      'In message.text, explain in a sentence or two how the lines clash, naming the other line number.',
      'Quote the clashing words verbatim, never echoing either line entirely.'
    ].join('\n');
  }
  manifesto() {
    return [
      '# Manifesto',
      '',
      'Review this manifesto, every line prefixed with its number:',
      '',
      '```',
      this.body(),
      '```'
    ].join('\n');
  }
  body() {
    const lines = this.doc.text().split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines
      .map((line, index) => `${index + 1}: ${line}`)
      .join('\n');
  }
}

module.exports = Prompt;
