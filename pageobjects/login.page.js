/**
 * Page object, unchanged in spirit from the Mocha project.
 *
 * Worth noticing: the page object layer is COMPLETELY unaffected by the
 * framework swap. Gherkin and step definitions sit on top of it; the
 * interaction layer underneath does not know or care which adapter is running.
 *
 * That is the practical reason the Cucumber layer is additive rather than a
 * rewrite — and also why it is easy to add and then regret, since nothing
 * forces you to delete it once the business stops reading the features.
 */
class LoginPage {
    get username() {
        return $('#username');
    }

    get password() {
        return $('#password');
    }

    get submit() {
        return $('button[type="submit"]');
    }

    get flash() {
        return $('#flash');
    }

    get logoutLink() {
        return $('a[href="/logout"]');
    }

    async open() {
        await browser.url('/login');
    }

    async signIn(user, pass) {
        // setValue on an empty string is a no-op in WebDriver, so an empty
        // credential has to clear the field explicitly — otherwise the previous
        // scenario's value survives and the Examples row for a blank username
        // silently tests something else.
        await this.username.waitForDisplayed({ timeout: 10_000 });
        await this.username.clearValue();
        if (user) await this.username.setValue(user);

        await this.password.clearValue();
        if (pass) await this.password.setValue(pass);

        await this.submit.waitForClickable({ timeout: 10_000 });
        await this.submit.click();
    }

    /** The flash text carries a trailing × from the dismiss button. */
    async flashText() {
        await this.flash.waitForDisplayed({ timeout: 10_000 });
        return (await this.flash.getText()).replace(/\s*×\s*$/, '').trim();
    }

    async signOut() {
        await this.logoutLink.waitForClickable({ timeout: 10_000 });
        await this.logoutLink.click();
    }
}

export default new LoginPage();
