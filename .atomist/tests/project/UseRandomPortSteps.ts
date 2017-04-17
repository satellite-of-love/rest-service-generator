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
import { File } from "@atomist/rug/model/File";

import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

const ContentNeedingChanging = 
`@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = SpringRestApplication.class, webEnvironment = WebEnvironment.DEFINED_PORT)
public class SpringRestWebIntegrationTests {
}`

Given("test file that needs changing at path (.*)", (p: Project, w, path: string) => {
    console.log(`The file is [${path}], pmv=${p}`);
    p.addFile(path, ContentNeedingChanging);
});

When("UseRandomPort editor is invoked", (p: Project, world: ProjectScenarioWorld) => {
    let ed = world.editor("UseRandomPort");
    world.editWith(ed, {});
});

// TODO can remove this on Rug upgrade as well-known steps will contain this step
Then("file at ([^ ]+) should contain (.*)", (p, w, path: string, lookFor: string) => {
    let f = p.findFile(path);
    if (f == null) 
        throw new Error(`File at [${path}] expected, but not found`)
    let idx = f.content.indexOf(lookFor);
    if (idx == -1)
        throw new Error(`File at [${path}] did not contain [${lookFor}]. Content was\n${f.content}`)
    return true;
});
