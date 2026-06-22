/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');
const mask = require('../mask');

const ALLOWLIST = new Set([
  'AI',
  'CI',
  'CD',
  'CLI',
  'API',
  'URL',
  'URI',
  'HTTP',
  'HTTPS',
  'JSON',
  'YAML',
  'XML',
  'HTML',
  'CSS',
  'SQL',
  'ID',
  'OK',
  'OS',
  'IO',
  'NPM',
  'PR',
  'MIT',
  'SARIF',
  'SKILL',
  'CLAUDE'
]);

const initials = (gloss) => (gloss.match(/[A-Za-z]+/gu) || [])
  .map((word) => word[0].toUpperCase())
  .join('');

const defined = (masked) => {
  const found = new Set();
  const regex = /\b(?<acronym>[A-Z]{2,})\s*\(|\((?<gloss>[^)]+)\)/gu;
  let hit = regex.exec(masked);
  while (hit !== null) {
    if (hit.groups.acronym) {
      found.add(hit.groups.acronym);
    } else if (/^[A-Z]{2,}$/u.test(hit.groups.gloss)) {
      found.add(hit.groups.gloss);
    } else {
      found.add(initials(hit.groups.gloss));
    }
    hit = regex.exec(masked);
  }
  return found;
};

const undefining = (acronym, scope) => !scope.known.has(acronym) &&
  !ALLOWLIST.has(acronym);

/**
 * Jargon.
 *
 * Flags an acronym that lands in prose without ever being expanded. An
 * acronym counts as defined when the document, anywhere, follows it with
 * a parenthetical gloss, as in "RBAC (role-based access control)", when
 * a parenthetical's word initials spell it, as in "AAA pattern
 * (Arrange-Act-Assert)", or when the expansion precedes a parenthetical
 * acronym, as in "Virtual Private Network (VPN)", so a single expansion
 * licenses every later mention. Well-known acronyms sit
 * in a built-in allowlist and pass untouched. Only the first unexpanded
 * occurrence of each acronym is reported.
 */
class Jargon {
  constructor() {
    this.id = 'jargon';
  }
  hint() {
    return 'Expand each acronym on first use with a parenthetical gloss, and replace rare domain jargon with plain words a fresh reader can parse.';
  }
  violations(document) {
    const uri = document.uri();
    const known = defined(mask(document.text()));
    const seen = new Set();
    return document.walk({
      header: () => [],
      prose: (text, line) => this.scan(text, line, {uri, known, seen}),
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
  }
  scan(text, line, scope) {
    const hits = [...mask(text).matchAll(/\b[A-Z]{2,}\b/gu)];
    return hits.reduce((found, hit) => {
      const [acronym] = hit;
      const novel = !scope.seen.has(acronym) && undefining(acronym, scope);
      scope.seen.add(acronym);
      return novel
        ? found.concat(this.flag(acronym, new Region(scope.uri, line, hit.index + 1)))
        : found;
    }, []);
  }
  flag(acronym, region) {
    return new Violation(
      this.id,
      'warning',
      `acronym "${acronym}" never expanded, define it on first use`,
      region
    );
  }
}

module.exports = Jargon;
