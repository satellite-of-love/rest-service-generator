Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the Make a new editor, which does things in the script.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: AddEditorFromCommitScript should edit a project correctly
    Given an empty project
    When the AddEditorFromCommitScript is run
    Then parameters were valid
    Then changes were made
    Then the hello file says hello
