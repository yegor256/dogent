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
  as a prototype of this idea, but the two lint different layers.
`agnix` validates the harness around a prompt — frontmatter schema,
  hook JSON, MCP config, tool wiring — asking whether the configuration
  is well-formed and correctly wired.
`dogent` lints the prose of the instructions themselves,
  asking whether every line is a tight, unambiguous command.
In short: `agnix` lints the harness, `dogent` lints the prompt.
`dogent` is the stricter, more opinionated of the two,
  aiming for extreme quality with no compromise.

## Usage

Run it on any manifesto file, no installation required:

```bash
npx @yegor256/dogent@0.7.2 SKILL.md
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
- Every section must be a level-2 (`##`) heading, below the lone `#` title.
- Every line must be no longer than 80 symbols.
- The whole file must stay under 4000 tokens.
- Every line must sound like a command.
- Every sentence must start with a capital and end with a period.
- No articles, no noise, no bloated text.
- Simple grammar, no ambiguity.
- No tangled, multi-clause instructions.
- A `SKILL.md` `name` must equal its parent directory.
- No courtesy or scaffolding words.
- No leftover markers or unfilled placeholders.
- A section must hold at most ten instructions.
- A `SKILL.md` `description` must say when to use the skill.
- Every line must carry exactly one instruction.
- No hedging or soft wording.
- No passive voice; use the active imperative.
- No instruction may repeat another.
- `SKILL.md` must open with valid frontmatter.
- Frontmatter must declare only allowed keys.
- A `SKILL.md` `name` must be kebab-case.

## AI verification

`dogent` works standalone by default,
  using fast deterministic checks with no network access.
When `OPENAI_API_KEY` is present in the environment,
  and only after the standalone rules find nothing,
  `dogent` asks OpenAI for a second, deeper opinion.
It sends the manifesto together with one instruction per rule,
  then prints any violation the model reports for ambiguity,
  weak phrasing, and instructions that only pretend to be commands.
The model defaults to `gpt-4o-mini`; override it with `OPENAI_MODEL`.
After the report, `dogent` prints a one-line usage summary to standard error,
  naming the model, the tokens sent and received, and an estimated cost,
  for example `OpenAI: gpt-4o-mini, 1234 sent, 567 received, ~$0.0005`.

```bash
export OPENAI_API_KEY=...
npx @yegor256/dogent CLAUDE.md
```

Pass `--offline` to keep `dogent` away from the LLM,
  even when `OPENAI_API_KEY` is present in the environment:

```bash
npx @yegor256/dogent --offline CLAUDE.md
```

Pass `--sarif` to print the report as SARIF instead of plain text.

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
      - run: npx @yegor256/dogent .
```

The job fails when `dogent` finds problems,
  blocking the merge until the manifestos are clean.
To enable AI verification in CI, expose a token as a secret:

```yaml
      - run: npx @yegor256/dogent CLAUDE.md
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
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
    rev: 0.7.2
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
