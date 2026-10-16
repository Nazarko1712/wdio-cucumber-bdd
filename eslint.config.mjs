import js from '@eslint/js';
import globals from 'globals';
import wdio from 'eslint-plugin-wdio';
import prettier from 'eslint-config-prettier';

/**
 * ESLint 9 flat config.
 *
 * This repo is plain JavaScript on purpose — it is the JS counterpart to the
 * TypeScript WebdriverIO repo, so the two can be compared. That costs the
 * type-checked ruleset: without types, `no-floating-promises` cannot exist,
 * because deciding whether an expression is a Promise requires the compiler.
 * The plugin's `await-expect` is a hand-written substitute for the one case
 * that matters most.
 *
 *   wdio/await-expect   a missing await on an expect-webdriverio assertion
 *                       leaves a pending Promise and the step passes having
 *                       asserted nothing
 *   wdio/no-pause       a fixed sleep instead of the actual condition
 *   wdio/no-debug       a leftover browser.debug() blocks CI until timeout
 *
 * This is a real argument for TypeScript in a test suite, and it is a better
 * one than "types catch typos": the compiler is what makes the un-awaited
 * assertion detectable at all.
 */
export default [
    {
        ignores: ['node_modules/', 'allure-results/', 'allure-report/', 'eslint.config.mjs'],
    },

    js.configs.recommended,

    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: { ...globals.node, browser: 'readonly', $: 'readonly', $$: 'readonly' },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-return-await': 'error',
            'require-await': 'error',
        },
    },

    {
        files: ['features/**/*.js', 'pageobjects/**/*.js'],
        ...wdio.configs['flat/recommended'],
        rules: {
            ...wdio.configs['flat/recommended'].rules,
            'wdio/await-expect': 'error',
            'wdio/no-pause': 'error',
            'wdio/no-debug': 'error',
        },
    },

    prettier,
];
