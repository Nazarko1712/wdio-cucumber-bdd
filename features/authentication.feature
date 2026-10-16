# Gherkin is written for a reader who does not read code. Every line here
# should make sense to a business analyst, which is the only reason the layer
# earns its keep — see the README for when it does not.

@auth
Feature: Signing in to the secure area
  As a registered user
  I want to sign in with my credentials
  So that I can reach content that is not public

  Background:
    Given I am on the login page

  @smoke
  Scenario: Successful sign-in
    When I sign in with valid credentials
    Then I should reach the secure area
    And I should see the message "You logged into a secure area"

  Scenario: Signing out again
    Given I have signed in with valid credentials
    When I sign out
    Then I should see the message "You logged out of the secure area"
    And the secure area should be blocked

  # Scenario Outline is the Gherkin form of data-driven testing: one scenario
  # body, a table of inputs. The runner expands it into one scenario per row and
  # names each after its values, so a failure says which row broke.
  Scenario Outline: Rejected sign-in attempts
    When I sign in as "<username>" with password "<password>"
    Then I should see the message "<message>"
    And I should not reach the secure area

    Examples:
      | username      | password             | message                   |
      | wrong-user    | SuperSecretPassword! | Your username is invalid! |
      | tomsmith      | wrong-password       | Your password is invalid! |
      | wrong-user    | wrong-password       | Your username is invalid! |
      |               | SuperSecretPassword! | Your username is invalid! |
      | tomsmith      |                      | Your password is invalid! |

  # The security finding from the sibling projects, expressed as a scenario a
  # non-engineer can read and object to.
  Scenario: Error messages reveal whether an account exists
    When I sign in as "definitely-not-a-user" with password "whatever"
    And I note the error message
    And I sign in as "tomsmith" with password "whatever"
    Then the two error messages should differ
