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

When("PrepareTravisBuild is called on a new rest service", (p, world) => {
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
    psworld.editWith(psworld.editor("PrepareTravisBuildFiles"), {
        encryptedDockerRegistryToken: constants.dockerRegistryToken,
        encryptedDockerRegistryUser: constants.dockerRegistryUser,
        encryptedGithubToken: constants.githubToken
    })
});

Then("the travis file exists", (p, world) => {
    return p.fileExists(".travis.yml")});

Then("the travis file contains the new secrets", (p, world) => {
    return (p.fileContains(".travis.yml", `- secure: ${constants.dockerRegistryToken}`)
        && p.fileContains(".travis.yml", `- secure: ${constants.githubToken}`)
        && p.fileContains(".travis.yml", `- secure: ${constants.dockerRegistryUser}`));
});

Then("and only the new secrets", (p, world) => {
    let matches = p.findFile(".travis.yml").content.match(/- secure:/g);
    let result = matches.length === 3;
    if (!result) {
        console.log(`TEST FAILURE: Found ${matches.length} secure keys`);
    }
    return result;
});