/**
 * WebdriverIO + Cucumber.
 *
 * THE POINT OF THIS REPOSITORY, in one config difference:
 *
 *   wdio-typescript-e2e        wdio-cucumber-bdd
 *   -------------------        -----------------
 *   framework: 'mocha'    ->   framework: 'cucumber'
 *   specs: *.spec.ts      ->   specs: *.feature
 *   mochaOpts             ->   cucumberOpts
 *
 * Everything else — the runner, the worker model, `maxInstances`, capabilities,
 * retries, reporters — is identical, because WebdriverIO ships its own
 * testrunner and only DELEGATES the "how tests are written" layer to a framework
 * adapter. Swapping `@wdio/mocha-framework` for `@wdio/cucumber-framework`
 * changes the syntax of the tests, not the machinery that runs them.
 *
 * Being able to state that distinction is the whole reason this project exists
 * alongside the Mocha one.
 */

const headed = process.env.HEADED === '1';
const isCI = !!process.env.CI;

export const config = {
    runner: 'local',

    // Features replace spec files. A .feature is plain text; the code that
    // backs it lives in the step definitions below.
    specs: ['../features/**/*.feature'],

    maxInstances: isCI ? 3 : 5,
    baseUrl: 'https://the-internet.herokuapp.com',

    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    ...(headed ? [] : ['--headless=new']),
                    '--disable-gpu',
                    '--no-sandbox',
                    '--window-size=1440,900',
                ],
            },
            acceptInsecureCerts: true,
        },
    ],

    logLevel: 'error',
    waitforTimeout: 10_000,
    connectionRetryTimeout: 90_000,
    connectionRetryCount: 3,

    specFileRetries: isCI ? 1 : 0,
    specFileRetriesDeferred: true,

    framework: 'cucumber',

    cucumberOpts: {
        require: ['./features/step-definitions/**/*.js'],

        /**
         * `strict` fails the run on an UNDEFINED or PENDING step rather than
         * reporting it and moving on. Without it a typo in a Gherkin sentence
         * produces a green run with a silently skipped scenario — the single
         * most dangerous Cucumber default.
         */
        strict: true,

        timeout: 60_000,
        tagExpression: process.env.TAGS ?? '',
        failFast: false,
        retry: 0,
    },

    reporters: [
        'spec',
        ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: false }],
    ],

    /** Screenshot on failure only; a green run should leave no artefacts. */
    afterStep: async function (_step, _scenario, { error }) {
        if (error) {
            await browser.takeScreenshot();
        }
    },
};
