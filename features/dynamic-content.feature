@dynamic
Feature: Content that appears and changes after a delay
  As a user on a slow connection
  I want the page to finish what it started
  So that I am not left looking at a half-rendered screen

  @smoke
  Scenario: Content arrives after the action
    Given I am on the dynamic loading page
    When I start the loading process
    Then the result "Hello World!" should appear

  Scenario: The result is absent before the action
    Given I am on the dynamic loading page
    Then the result should not exist yet

  # A Data Table passes structured input to ONE step, as opposed to Scenario
  # Outline which repeats the whole scenario per row. Use a table when the rows
  # belong to a single action, and an Outline when each row is its own scenario.
  Scenario: Controls reach the states the specification lists
    Given I am on the dynamic controls page
    Then the controls should start in these states:
      | control  | state    |
      | checkbox | present  |
      | input    | disabled |

  Scenario: Enabling the input makes it editable
    Given I am on the dynamic controls page
    When I enable the input
    Then I should be able to type "now editable" into it

  Scenario: Removing the checkbox takes it out of the page
    Given I am on the dynamic controls page
    When I remove the checkbox
    Then the checkbox should no longer exist
    And I should see the confirmation "It's gone!"
