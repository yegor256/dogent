/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Prompt.
 *
 * The full request handed to the AI oracle, laid out as a Markdown
 * document: a Task section fixing the role and reply shape, a Checks
 * section bulleting one bold-named rule per line, and a Manifesto
 * section fencing the file under review with every line numbered so
 * the oracle can cite an exact row.
 */
class Prompt {
  constructor(rules, document) {
    this.rules = rules;
    this.doc = document;
  }
  text() {
    return [this.task(), this.checks(), this.manifesto()].join('\n\n');
  }
  task() {
    const uri = this.doc.uri();
    return [
      '# Task',
      '',
      'You are a strict linter for an AI-agent manifesto.',
      `The file under review is "${uri}".`,
      'The manifesto is written in a terse house style: each line is',
      'one compressed imperative command, with articles and filler',
      'words deliberately stripped. Read the first word of every line',
      'as an imperative verb, so "Tag release before shipping" is the',
      'order "tag the release", not a noun phrase about a tag. Never',
      'flag a line for being short, for dropping articles, or for',
      'omitting a subject; that compression is the required style.',
      'A heading opens a section, and every line beneath it, until the',
      'next heading, belongs to that section. Treat a deeper heading as',
      'a subsection of the one above, never as a misplaced instruction.',
      'Apply only the checks listed in the Checks section below.',
      'Most manifestos are clean. An empty result list is the normal,',
      'expected reply: when no line clearly breaks a listed check,',
      'report nothing and return {"results": []}. Never invent a',
      'violation to seem useful, and never flag a line merely for',
      'sitting in a plain, on-topic section.',
      'Report a violation only when you are certain it breaks a check.',
      'Give every result a "confidence" number from 0 to 1, your own',
      'probability that the violation is real, and omit any result you',
      'score below 0.6. When unsure, lower the confidence, never guess.',
      'Reply with one JSON object and nothing else, shaped as',
      '{"results":[ ... ]}, where each item is a SARIF result with',
      'keys ruleId, level "warning", message.text, confidence, and',
      'locations. Set ruleId to the rule name and startLine to the',
      'printed line number; locations[0].physicalLocation must carry',
      `artifactLocation.uri "${uri}" and region.startColumn 1.`,
      'In message.text, explain in a sentence or two why the line',
      'breaks the check, then suggest how to fix it; never quote or',
      'echo the offending line, the line number already locates it.'
    ].join('\n');
  }
  checks() {
    return [
      '# Checks',
      '',
      'Apply each of these checks, named in bold, to every line:',
      '',
      this.bullets()
    ].join('\n');
  }
  bullets() {
    return this.rules
      .map((rule) => rule.prompt())
      .filter((fragment) => fragment !== '')
      .map((fragment) => `- ${fragment.replace(/^([\w-]+): /u, '**$1**: ')}`)
      .join('\n');
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
