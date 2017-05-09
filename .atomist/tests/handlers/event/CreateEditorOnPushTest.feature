Feature: CreateEditorOnPush handler handles events
  This is the sample Gherkin feature file for the BDD tests of
  the sample TypeScript event handler used by AddCreateEditorOnPush.
  Feel free to modify and extend to suit the needs of your handler.


  Scenario: Executing a sample event handler
    Given the CreateEditorOnPush is registered
    When a new Push is received
    Then the CreateEditorOnPush event handler should respond with the correct message
