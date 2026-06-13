/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Prompt.
 *
 * The full request handed to the AI oracle: a header fixing the task and
 * the reply shape, one fragment per rule, and the manifesto itself with
 * every line numbered so the oracle can cite an exact row.
 */
class Prompt {
  constructor(rules, document) {
    this.rules = rules;
    this.doc = document;
  }
  text() {
    return [this.header(), this.fragments(), this.body()].join('\n\n');
  }
  header() {
    const uri = this.doc.uri();
    return [
      'You are a strict linter for an AI-agent manifesto.',
      `The file under review is "${uri}".`,
      'Apply only the checks listed below this header.',
      'Report a violation only when it is clear and certain.',
      'When in doubt, stay silent and report nothing.',
      'Reply with one JSON object and nothing else, shaped as',
      '{"results":[ ... ]}, where each item is a SARIF result with',
      'keys ruleId, level "warning", message.text, and locations.',
      'Set ruleId to the rule name and startLine to the printed',
      'line number; locations[0].physicalLocation must carry',
      `artifactLocation.uri "${uri}" and region.startColumn 1.`
    ].join('\n');
  }
  fragments() {
    return this.rules
      .map((rule) => rule.prompt())
      .filter((fragment) => fragment !== '')
      .join('\n');
  }
  body() {
    return this.doc
      .text()
      .split('\n')
      .map((line, index) => `${index + 1}: ${line}`)
      .join('\n');
  }
}

module.exports = Prompt;
