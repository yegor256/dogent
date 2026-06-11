# Dogent

Lint agentic manifesto files like SKILL.md and CLAUDE.md.

## Mission

Demand extreme quality, reject every compromise.
Treat each line as one instruction, nothing else.
Run standalone by default, call AI only when token exists.

## Pipeline

Parse one manifesto into fragments.
Wrap fragments into one Document.
Apply every rule to that Document.
Gather violations, render SARIF-like output.
Exit non-zero once any violation appears.

## Parsing

Read manifesto line by line, never through grammar.
Track context: inside fence, inside bullet list.
Classify each line from current context.
Emit fragments in original order.

## Fragments

Model each piece as one immutable fragment.
Use Header for section heading lines.
Use Prose for single instruction lines.
Use Bullets for grouped bullet items.
Use Snippet for fenced code blocks.
Dispatch through accept, expose nothing else.
Forbid type checks, casting, reflection.

## Rules

Take whole Document, return violations.
Walk fragments through double dispatch.
Keep every rule final and immutable.
Add fresh rules without touching old rules.

## Checks

Demand every line carry one instruction.
Group instructions under short sections.
Limit section names to three words.
Cap every line at eighty symbols.
Phrase every line as one command.
Strip articles, noise, bloated wording.
Favor simple grammar over ambiguity.

## Quality

Write tests before changing behavior.
Hold one assertion per test.
Map test files one to one with features.
Run dogent against itself inside CI.
