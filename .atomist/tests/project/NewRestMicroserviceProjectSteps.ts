/*
 * Copyright © 2016 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

import * as constants from "./Constants"

When("NewRestService is provided all parameters", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let generator = psworld.generator("NewRestService");
    psworld.generateWith(generator, constants.projectName, {
        artifactId: constants.artifactId,
        rootPackage: constants.rootPackage,
        version: constants.version,
        serviceClassName: constants.serviceClassName,
        groupId: constants.groupId,
        description: constants.description
    });
});

Then("the class source file exists", (p, world) => {
    return p.fileExists(constants.srcPath);
});

Then("the class source file contains the class name", (p, world) => {
    return p.fileContains(constants.srcPath, 
    `public class ${constants.serviceClassName}Application `);
});

Then("the class source file contains the package name", (p, world) => {
    return p.fileContains(constants.srcPath, `package ${constants.rootPackage}`);
});

Then("the class source file should not contain the original class name", (p, world) => {
    return !p.fileContains(constants.srcPath, "SpringRestApplication");
});

Then("the class source file should not contain the original package name", (p, world) => {
    return !p.fileContains(constants.srcPath, "com.atomist.springrest");
});

Then("the class test file exists", (p, world) => {
    return p.fileExists(constants.testPath);
});

Then("the class test file contains the class name", (p, world) => {
    return p.fileContains(constants.testPath, `public class ${constants.serviceClassName}ApplicationTests `);
});

Then("the class test file contains the package name", (p, world) => {
    return p.fileContains(constants.testPath, `package ${constants.rootPackage}`);
});

Then("the class test file should not contain the original class name", (p, world) => {
    return !p.fileContains(constants.testPath, "SpringRestApplicationTests");
});

Then("the class test file should not contain the original package name", (p, world) => {
    return !p.fileContains(constants.testPath, "com.atomist.springrest");
});

Then("only one package of tests exists", (p, world) => {
    // TODO: implement this. I don't think project gives me enough
    // methods, without path expressions, to list the filenames in a dir

    // I want to test that I haven't (by implementing an edit that uses files)
    // added a new package to the output.

    // After implementing, put it in the test. See it fail.
    return true; 
})

Then("the class test file exists", (p, world) => {
    return p.fileExists(constants.testPath);
});

Then("the POM file contains the artifact ID", (p, world) => {
    return p.fileContains(constants.pomPath, constants.artifactId);
});

Then("the POM file contains the version", (p, world) => {
    return p.fileContains(constants.pomPath, constants.version);
});

Then("the README contains the project name", (p, world) => {
    return p.fileContains(constants.readmePath, constants.projectName);
});

Then("the README contains the description", (p, world) => {
    return p.fileContains(constants.readmePath, constants.description);
});

Then("the README contains help", (p, world) => {
    return p.fileContains(constants.readmePath, "Need Help?");
});

Then("the README contains Spring Boot", (p, world) => {
    return p.fileContains(constants.readmePath, "[Spring Boot]");
});

Then("the README contains Maven link", (p, world) => {
    return p.fileContains(constants.readmePath, "[Maven][mvn]");
});

Then("the README contains Maven instructions", (p, world) => {
    return p.fileContains(constants.readmePath, "mvn spring-boot:run");
});

Then("the README should not contain Rug information", (p, world) => {
    return !p.fileContains(constants.readmePath, "## Rug");
});

Then("the props file should exist", (p, world) => {
    return p.fileExists(constants.propsFile);
});

Then("the props file contains the server port", (p, world) => {
    return p.fileContains(constants.propsFile, "server.port=8080");
});

Then("the LICENSE file should not exist", (p, world) => {
    return !p.fileExists("LICENSE");
});

Then("the CHANGELOG file should exist", (p, world) => {
    return p.fileExists("CHANGELOG.md");
});

Then("the CHANGELOG file should not contain releases from this project", (p, world) => {
    return !p.fileContains("CHANGELOG.md", "0.3.0");
});

Then("the code of conduct file should not exist", (p, world) => {
    return !p.fileExists("CODE_OF_CONDUCT.md");
});

Then("the Travis CI configuration should not exist", (p, world) => {
    return !p.fileExists(".travis.yml");
});

When("NewRestService is provided all parameters but description", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let generator = psworld.generator("NewRestService");
    psworld.generateWith(generator, constants.projectName, {
        artifactId: constants.artifactId,
        rootPackage: constants.rootPackage,
        version: constants.version,
        serviceClassName: constants.serviceClassName,
        groupId: constants.groupId
    });
});

When("RestService for NewRestService should fail when given an invalid parameter", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let generator = psworld.generator("NewRestService");
    let badVersion = "not.valid.version";
    psworld.generateWith(generator, constants.projectName, {
        artifactId: constants.artifactId,
        rootPackage: constants.rootPackage,
        version: badVersion,
        serviceClassName: constants.serviceClassName,
        groupId: constants.groupId,
        description: constants.description
    });
});
