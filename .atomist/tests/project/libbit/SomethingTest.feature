Feature: Lib lib libbits Something
  The Something libbit editor copies Something into your project.


  Scenario: SomethingLibbit should add sample files to the project
    Given an empty project
    When the SomethingLibbit is run
    Then changes were made
    Then the new Something source file exists
    Then the new Something test files exist

  Scenario: SomethingLibbit should do nothing when a file already exists
    Given the new Something source file already exists
    When the SomethingLibbit is run
    Then no changes were made