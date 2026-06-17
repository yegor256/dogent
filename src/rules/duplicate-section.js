/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

const Violation = require('../violation');
const Region = require('../region');

const bare = (text) => text.replace(/^#{1,6}\s*/u, '').trim();

const normalize = (text) => bare(text).toLowerCase().replace(/\s+/gu, ' ');

/**
 * DuplicateSection.
 *
 * Rejects two headings that carry the same name, so each section owns
 * a distinct title. It collects every heading in order, normalizes it
 * by case and whitespace, then flags the second and any later twin
 * while leaving the first occurrence clean. Distinct from unique,
 * which targets repeated prose instructions, and from short-sections,
 * which targets heading length; this one targets repeated heading
 * names. Its prompt stays empty since the check is fully
 * deterministic.
 */
class DuplicateSection {
  constructor() {
    this.id = 'duplicate-section';
  }
  prompt() {
    return '';
  }
  violations(document) {
    const uri = document.uri();
    const headers = document.walk({
      header: (text, row) => [{text, row}],
      prose: () => [],
      snippet: () => [],
      bullets: () => [],
      frontmatter: () => []
    });
    return this.repeats(uri, headers);
  }
  repeats(uri, headers) {
    const seen = new Set();
    const found = [];
    headers.forEach((header) => {
      const norm = normalize(header.text);
      if (seen.has(norm)) {
        found.push(new Violation(
          this.id,
          'warning',
          `duplicate section "${bare(header.text)}", give each section a distinct name`,
          new Region(uri, header.row, 1)
        ));
      } else {
        seen.add(norm);
      }
    });
    return found;
  }
}

module.exports = DuplicateSection;
