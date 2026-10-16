# wdio-cucumber-bdd

WebdriverIO + Cucumber in **JavaScript**, against the same application as
[wdio-typescript-e2e](https://github.com/Nazarko1712/wdio-typescript-e2e) — with
the framework adapter swapped and nothing else.

**13 scenarios, 48 steps, 2 feature files.** Target:
[the-internet.herokuapp.com](https://the-internet.herokuapp.com).

## Prerequisites

| Requirement          | Notes                                                                        |
| -------------------- | ---------------------------------------------------------------------------- |
| **Node.js 20.18.1+** | pinned to 22 in `.nvmrc`                                                     |
| **Chrome**           | WebdriverIO downloads a matching Chrome for Testing and driver automatically |
| **Network access**   | `the-internet.herokuapp.com`                                                 |
| **Allure CLI**       | only for `npm run report`                                                    |

## Setup

```bash
nvm use
npm ci
```

## Running

**Headless** — the default, and what CI runs:

```bash
npm test                 # every feature, 5 parallel workers
npm run test:smoke       # only scenarios tagged @smoke
npm run test:auth        # only the @auth feature
TAGS='@dynamic and not @smoke' npm test
```

**Headed** — watch the browser:

```bash
npm run test:headed
HEADED=1 npx wdio run ./config/wdio.conf.js --cucumberOpts.tagExpression='@smoke'
```

Headedness is driven by the `HEADED` environment variable, because it controls
`--headless=new` in `goog:chromeOptions` — a browser launch argument, so it
belongs to the capability rather than to the runner.

**Other:**

```bash
npm run test:dry         # parse features and match steps WITHOUT running a browser
npm run report           # generate and open the Allure report
```

`test:dry` is the fastest way to catch an unmatched Gherkin sentence — it
reports undefined steps in seconds instead of after a full browser run.

## Why this repository exists

To make one claim concrete instead of theoretical:

> WebdriverIO ships its **own testrunner**. It owns browser sessions, worker
> processes and parallelism, and delegates only the _"how tests are written"_
> layer to a framework adapter.

Here is the entire difference between this project and the Mocha one:

|          | `wdio-typescript-e2e`   | `wdio-cucumber-bdd`            |
| -------- | ----------------------- | ------------------------------ |
| adapter  | `@wdio/mocha-framework` | `@wdio/cucumber-framework`     |
| config   | `framework: 'mocha'`    | `framework: 'cucumber'`        |
| options  | `mochaOpts`             | `cucumberOpts`                 |
| tests    | `*.spec.ts`             | `*.feature` + step definitions |
| language | TypeScript              | JavaScript                     |

The runner, the worker model, `maxInstances`, capabilities, retry policy,
reporters and the **page object layer** are unchanged. The page objects in
particular are untouched: Gherkin and step definitions sit on top of them, and
the interaction layer underneath does not know which adapter is running.

## Gherkin constructs covered

| Construct                       | Where                         | What it is for                                                            |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `Background`                    | `authentication.feature`      | a Given shared by every scenario in the feature                           |
| `Scenario Outline` + `Examples` | rejected sign-ins             | one scenario body, a table of inputs — expanded into one scenario per row |
| `Data Table`                    | control states                | structured input to a **single** step                                     |
| Tags                            | `@auth`, `@smoke`, `@dynamic` | slicing the run without touching code                                     |
| Cucumber expressions            | `{string}` parameters         | one definition backing every Examples row                                 |

**Outline versus Data Table** is a real interview question: use an Outline when
each row is its own scenario with its own pass/fail, and a Data Table when the
rows are structured input to one action.

## The honest assessment of BDD

A portfolio project is the wrong place to pretend a tool has no cost, so:

### What it buys

The feature files are readable by someone who does not read code. Acceptance
criteria become executable, and the vocabulary in the feature becomes the
vocabulary the team uses in standups. That is the entire value proposition.

### What it costs

**Three files instead of one.** The Mocha project expresses the same
authentication coverage in a single spec. Here it takes a feature, a step
definition file and a page object. Every sentence in the feature only works if a
matching pattern exists in the steps.

**A typo in Gherkin is not a compile error.** With the default
`strict: false`, an unmatched sentence is reported as _undefined_ and the
scenario is **skipped** — producing a green run that tested nothing. This config
sets `strict: true` deliberately, and that is the single most important line in
it.

**Debugging goes through an extra layer.** A failure points at a step, and
finding the cause means jumping feature → step definition → page object.

**Step definitions drift toward duplication.** Two slightly different sentences
end up with two nearly identical implementations, because there is no compiler
telling you they overlap. Ambiguous patterns are a runtime error, not a build
one.

### When it is worth it

**Only if the business actually reads the features.** If the QA team writes the
Gherkin, the QA team reads the Gherkin, and no analyst has ever opened a
`.feature`, then the layer is pure overhead — three files and an indirection for
an audience of zero. The correct answer in that situation is Mocha or Jest, and
saying so is a better interview answer than defending BDD on principle.

## Findings

### `setValue('')` is a no-op

WebDriver's send-keys does nothing for an empty string, so a blank credential in
an `Examples` row leaves the **previous scenario's value** in the field — the row
appears to pass while testing something else entirely. `login.page.js` calls
`clearValue()` first and only sets a value when one is supplied.

### `strict: true` is not the default

Covered above, and worth repeating because it is the difference between a suite
that reports a problem and a suite that reports success.

### State between steps

Scenario state is kept in module scope rather than on Cucumber's `World`, which
would require `function` callbacks instead of arrows. Safe here because each
worker process runs one scenario at a time — and stated explicitly, since the
alternative assumption silently breaks under a different worker model.

## Linting and reports

```bash
npm run lint          # ESLint 9, flat config
npm run lint:fix
npm run format        # Prettier, writes
npm run format:check  # Prettier, reports (this is what CI runs)
npm run report        # generate and open the Allure report
```

This repo is plain JavaScript on purpose — it is the JS counterpart to the
TypeScript WebdriverIO project, so the two can be compared directly. That choice
has a concrete cost, and it is a better argument for TypeScript in a test suite
than "types catch typos":

**`no-floating-promises` cannot exist without a compiler.** Deciding whether an
expression is a Promise requires type information, so the single rule that
catches an un-awaited assertion — a test that passes having verified nothing —
is simply unavailable here. `eslint-plugin-wdio`'s hand-written `await-expect`
covers the one case it knows about, and nothing covers the rest.

| Rule                | What it catches                                        |
| ------------------- | ------------------------------------------------------ |
| `wdio/await-expect` | a missing `await` on an `expect-webdriverio` assertion |
| `wdio/no-pause`     | a fixed sleep instead of the actual condition          |
| `wdio/no-debug`     | a leftover `browser.debug()` that blocks CI            |

### Reports

Allure, the same as the TypeScript project, so the two runs are comparable
artifact-for-artifact. `npm run report` generates and opens it.

### Where this runs in CI

Linting and formatting are their **own job**, not steps inside the test job.
They need no browser, no network and no secrets, and they finish in seconds, so
as a separate job they run concurrently with the suite: a formatting failure
does not wait behind a long test run, and a real test failure is not hidden
behind a formatting failure. Both verdicts arrive on their own.

CI runs the `--check` variants, never the formatter itself. A pipeline reports
on the branch it was asked to verify; it does not rewrite it.
