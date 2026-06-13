# Dogmatic Linter for Agent Skills and Manifestos

[![dogent](https://github.com/yegor256/dogent/actions/workflows/dogent.yml/badge.svg)](https://github.com/yegor256/dogent/actions/workflows/dogent.yml)
[![PDD status](https://www.0pdd.com/svg?name=yegor256/dogent)](https://www.0pdd.com/p?name=yegor256/dogent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yegor256/dogent/blob/master/LICENSE.txt)
[![NPM version](https://badge.fury.io/js/@yegor256%2Fdogent.svg)](https://badge.fury.io/js/@yegor256%2Fdogent)

A strict, opinionated linter for agentic manifesto files
  such as `SKILL.md`, `CLAUDE.md`, and `AGENTS.md`.

These files instruct AI agents.
Vague, bloated, or ambiguous instructions make agents behave unpredictably.
`dogent` enforces a clear, command-style discipline
  so every line earns its place.

We respect [agent-sh/agnix](https://github.com/agent-sh/agnix)
  as a prototype of this idea.
`dogent` goes further: it is stricter, more opinionated,
  and aims for extreme quality with no compromise.

## Usage

Run it on any manifesto file, no installation required:

```bash
npx @yegor256/dogent@0.4.0 CLAUDE.md
```

Lint several files at once:

```bash
npx @yegor256/dogent SKILL.md CLAUDE.md AGENTS.md
```

Point it at a directory to lint the default manifestos it holds
  (`AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `SKILLS.md`).
The directory is scanned recursively through every subfolder
  (skipping `node_modules` and `.git`),
  and each scanned file is announced on the standard error stream:

```bash
npx @yegor256/dogent .
```

Sample output:

```text
CLAUDE.md
  12:  line exceeds 80 symbols
  18:  not an instruction, sounds like description
  24:  article "the" detected, remove noise
  31:  section name too long, use 1-3 words

4 problems found, exit code 1
```

The command exits with a non-zero status when problems are found,
  so it plugs directly into CI and pre-commit hooks.

## Rules

`dogent` checks that every manifesto obeys these rules:

- Every line must be an instruction.
- Instructions must be grouped in sections.
- Section names must be short, 1-3 words.
- Every line must be no longer than 80 symbols.
- The whole file must stay under 4000 tokens.
- Every line must sound like a command.
- Every sentence must start with a capital and end with a period.
- No articles, no noise, no bloated text.
- Simple grammar, no ambiguity.
- `SKILL.md` must open with valid frontmatter.
- Frontmatter must declare only allowed keys.

## AI verification

`dogent` works standalone by default,
  using fast deterministic checks with no network access.
When `OPENAI_API_KEY` or `CLAUDE_TOKEN` is present in the environment,
  it additionally uses AI to verify the text for ambiguity,
  weak phrasing, and instructions that only pretend to be commands:

```bash
export CLAUDE_TOKEN=...
npx @yegor256/dogent CLAUDE.md
```

## GitHub Actions

Because `dogent` runs through `npx`, no extra action is needed.
Add a single step to any workflow to lint your manifestos on every push:

```yaml
name: dogent
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx @yegor256/dogent CLAUDE.md SKILL.md
```

The job fails when `dogent` finds problems,
  blocking the merge until the manifestos are clean.
To enable AI verification in CI, expose a token as a secret:

```yaml
      - run: npx @yegor256/dogent CLAUDE.md
        env:
          CLAUDE_TOKEN: ${{ secrets.CLAUDE_TOKEN }}
```

## Pre-commit hook

Run `dogent` before every commit so broken manifestos never reach history.
Drop this into `.git/hooks/pre-commit` and make it executable:

```bash
#!/bin/sh
npx @yegor256/dogent CLAUDE.md SKILL.md AGENTS.md
```

Prefer the [pre-commit](https://pre-commit.com) framework?
Reference `dogent` as a remote hook in `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/yegor256/dogent
    rev: 0.4.0
    hooks:
      - id: dogent
```

Pin `rev` to a released tag for reproducible runs.
Alternatively, wire `dogent` as a local hook:

```yaml
repos:
  - repo: local
    hooks:
      - id: dogent
        name: dogent
        entry: npx @yegor256/dogent
        language: system
        files: '(CLAUDE|SKILL|AGENTS)\.md$'
```

Either way, the commit is rejected until every flagged line is fixed.
