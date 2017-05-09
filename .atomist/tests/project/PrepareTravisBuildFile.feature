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


Feature: PrepareTravisBuildFiles editor should create travis build files
  PrepareTravisBuild is called on a new rest service
  should successfully create Spring Boot REST service projects
  according to its input parameters. Is this filler text or executable?


  Scenario: It should work
    Given the archive root
    When PrepareTravisBuild is called on a new rest service
    Then the travis file exists
    Then the travis file contains the new secrets
 