# Copyright © 2016 Atomist, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


Feature: NewRestService generator should create Spring Boot REST service projects
  The Atomist NewRestService Rug generator
  should successfully create Spring Boot REST service projects
  according to its input parameters.


  Scenario: NewRestService should create a new project given all valid input
    Given the archive root
    When NewRestService is provided all parameters
    Then parameters were valid
    Then the class source file should not contain the original class name
    Then the class source file should not contain the original package name
    Then the class test file should not contain the original class name
    Then the class test file should not contain the original package name
    Then the source directory should contain only the minimum files  // TODO: implement rug#539 so that I can implement this test
    Then the test directory should contain only the minimum files
    Then the POM file contains the artifact ID
    Then the POM file contains the version
    Then the README contains the project name
    Then the README contains the description
    Then the README contains help
    Then the README contains Spring Boot
    Then the README contains Maven link
    Then the README contains Maven instructions
    Then the README should not contain Rug information
    Then the props file should exist
    Then the props file contains the server port
    Then the LICENSE file should not exist
    Then the CHANGELOG file should exist
    Then the CHANGELOG file should not contain releases from this project
    Then the code of conduct file should not exist
    Then the Travis CI configuration should not exist


  Scenario: NewRestService without description should create a new project
    Given the archive root
    When NewRestService is provided all parameters but description
    Then parameters were valid
    Then the POM file contains the artifact ID
    Then the POM file contains the version
    Then the README contains the project name
    Then the props file should exist
    Then the props file contains the server port
    Then the LICENSE file should not exist
    Then the CHANGELOG file should exist
    Then the CHANGELOG file should not contain releases from this project
    Then the code of conduct file should not exist


