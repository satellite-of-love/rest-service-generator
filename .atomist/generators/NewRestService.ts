/*
 * Copyright © 2017 Atomist, Inc.
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

import { PopulateProject } from '@atomist/rug/operations/ProjectGenerator';
import { Project } from '@atomist/rug/model/Core';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Generator, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import { File } from '@atomist/rug/model/File';

import { cleanReadMe, cleanChangeLog, removeUnnecessaryFiles, updatePom, movePackage, renameClass } from './RugGeneratorFunctions';

/**
 * Atomist Rug generator for creating a new Spring Boot REST service
 * project.
 */
@Generator("NewRestService", "creates a new Spring Boot REST service project")
@Tags("java", "satellite-of-love")
export class NewRestService implements PopulateProject {

    groupId: string = "satellite-of-love";

    version: string = "1.0.0-SNAPSHOT";

    @Parameter({
        displayName: "Project Description",
        description: "short descriptive text describing the new project",
        pattern: Pattern.any,
        validInput: "free text",
        minLength: 1,
        maxLength: 100,
        required: false
    })
    description: string = "Mystery Project"

    rootPackage: string = "com.jessitron";

    populate(project: Project) {
        let artifactId = project.name;
        let serviceClassName = this.capitalise(this.camelCase(project.name));
        cleanReadMe(project, this.description, this.groupId);
        cleanChangeLog(project, this.groupId);
        removeUnnecessaryFiles(project);
        updatePom(project, artifactId, this.groupId, this.version, this.description);
        movePackage(project, "com.atomist.springrest", this.rootPackage);
        renameClass(project, "SpringRest", serviceClassName);
    }

    private camelCase(str: string) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/[\s-_]+/g, '');
    }

    private capitalise(str: string) {
        return (str.substr(0, 1).toUpperCase() + str.substr(1));
    }
}

export const newRestService = new NewRestService();
