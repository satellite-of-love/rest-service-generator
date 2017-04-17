Feature: UseRandomPort editor should correctly change port
  The UseRandomPort editor should correctly
  change Spring web integration tests to
  use the correct port.

  Scenario: UseRandomPort editor should not modify if no tests present
    Given the archive root
    When UseRandomPort editor is invoked
    Then no changes were made

Scenario: UseRandomPort editor should modify test tree file needing update
    Given test file that needs changing at path src/test/java/jessitron/SpringRestWebIntegrationTests.java
    When UseRandomPort editor is invoked
    Then file at src/test/java/jessitron/SpringRestWebIntegrationTests.java should contain RANDOM_PORT
