/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

'use strict';

/**
 * Mask.
 *
 * Blanks out inline-code spans inside a prose line so word-scanning
 * rules never match quoted examples or filename templates. Each
 * backtick run becomes equal-length spaces, keeping every column
 * offset intact for the violations that survive.
 */
const mask = (text) => text.replace(/`[^`]*`/gu, (span) => ' '.repeat(span.length));

module.exports = mask;
