import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';

/**
 * Steps for the dynamic-content feature.
 *
 * The Data Table step below shows both halves of the trade-off: the Gherkin
 * reads as a specification a non-engineer can check, and the code underneath is
 * noticeably more indirect than the equivalent Mocha assertion would be —
 * a lookup table mapping table rows onto selectors and expectations.
 */

const CONTROLS = {
    checkbox: () => $('#checkbox input'),
    input: () => $('#input-example input'),
};

Given('I am on the dynamic loading page', async () => {
    await browser.url('/dynamic_loading/2');
});

Given('I am on the dynamic controls page', async () => {
    await browser.url('/dynamic_controls');
});

When('I start the loading process', async () => {
    const start = await $('#start button');
    await start.waitForClickable({ timeout: 10_000 });
    await start.click();
});

When('I enable the input', async () => {
    await (await $('#input-example button')).click();
    await (await $('#input-example input')).waitForEnabled({
        timeout: 15_000,
        timeoutMsg: 'input never became enabled',
    });
});

When('I remove the checkbox', async () => {
    await (await $('#checkbox-example button')).click();
    await (await $('#checkbox input')).waitForExist({
        timeout: 15_000,
        reverse: true,
        timeoutMsg: 'checkbox was never removed from the DOM',
    });
});

Then('the result {string} should appear', async (text) => {
    const finish = await $('#finish');
    await finish.waitForDisplayed({ timeout: 15_000 });
    await expect(finish).toHaveText(text);
});

Then('the result should not exist yet', async () => {
    await expect($('#finish')).not.toBeExisting();
});

/**
 * `dataTable.hashes()` turns the table into an array of objects keyed by the
 * header row, which is the usual way to consume one.
 */
Then('the controls should start in these states:', async (dataTable) => {
    for (const row of dataTable.hashes()) {
        const element = CONTROLS[row.control]();

        switch (row.state) {
            case 'present':
                await expect(element).toBeExisting();
                break;
            case 'absent':
                await expect(element).not.toBeExisting();
                break;
            case 'disabled':
                await expect(element).toBeDisplayed();
                await expect(element).not.toBeEnabled();
                break;
            case 'enabled':
                await expect(element).toBeEnabled();
                break;
            default:
                throw new Error(`unknown expected state "${row.state}" for "${row.control}"`);
        }
    }
});

Then('I should be able to type {string} into it', async (text) => {
    const input = await $('#input-example input');
    await input.setValue(text);
    await expect(input).toHaveValue(text);
});

Then('the checkbox should no longer exist', async () => {
    await expect($('#checkbox input')).not.toBeExisting();
});

Then('I should see the confirmation {string}', async (text) => {
    await expect($('#message')).toHaveText(text);
});
