import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginPage from '../../pageobjects/login.page.js';

/**
 * Step definitions — the glue between a Gherkin sentence and the page object.
 *
 * This file is where the cost of BDD becomes visible. The Mocha project needed
 * ONE file to express the same coverage; this needs three (feature, steps, page
 * object), and a sentence in the feature only works if a matching pattern exists
 * here. A typo in Gherkin is not a compile error — with `strict: false` it is a
 * silently skipped scenario and a green run.
 *
 * State between steps is kept in module scope rather than on `this`, because
 * arrow-free `function` callbacks would be required for Cucumber's World
 * binding and that trades one awkwardness for another. Module scope is safe
 * here because each worker process runs one scenario at a time.
 */
let notedMessage = '';

Given('I am on the login page', async () => {
    await LoginPage.open();
});

Given('I have signed in with valid credentials', async () => {
    await LoginPage.open();
    await LoginPage.signIn('tomsmith', 'SuperSecretPassword!');
    await expect(LoginPage.logoutLink).toBeDisplayed();
});

When('I sign in with valid credentials', async () => {
    await LoginPage.signIn('tomsmith', 'SuperSecretPassword!');
});

/**
 * `{string}` is a Cucumber expression parameter — it captures a quoted value
 * from the sentence. This single definition backs every row of the Examples
 * table, which is what makes Scenario Outline worthwhile.
 */
When('I sign in as {string} with password {string}', async (user, pass) => {
    await LoginPage.open();
    await LoginPage.signIn(user, pass);
});

When('I note the error message', async () => {
    notedMessage = await LoginPage.flashText();
});

When('I sign out', async () => {
    await LoginPage.signOut();
});

Then('I should reach the secure area', async () => {
    await expect(browser).toHaveUrl(expect.stringContaining('/secure'));
    await expect(LoginPage.logoutLink).toBeDisplayed();
});

Then('I should not reach the secure area', async () => {
    await expect(LoginPage.logoutLink).not.toBeExisting();
});

Then('I should see the message {string}', async (message) => {
    expect(await LoginPage.flashText()).toContain(message);
});

Then('the secure area should be blocked', async () => {
    await browser.url('/secure');
    expect(await LoginPage.flashText()).toContain('You must login to view the secure area');
});

Then('the two error messages should differ', async () => {
    const second = await LoginPage.flashText();

    // Different messages for "no such user" and "wrong password" let an attacker
    // enumerate accounts from the error text alone.
    expect(notedMessage).not.toEqual(second);
    expect(notedMessage.length).toBeGreaterThan(0);
});
