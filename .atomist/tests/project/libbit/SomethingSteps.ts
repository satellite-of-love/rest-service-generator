import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

const sourceFiles = [ "src/main/java/com/atomist/springrest/addrestendpoint/OneEndpointController.java" ];
const testFiles = [];

When("the SomethingLibbit is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const editor = w.editor("SomethingLibbit");
    w.editWith(editor);
});

Then("the new Something source file exists", (p: Project, world) => {
    return sourceFiles.every((f) => p.fileExists(f));
});

Then("the new Something test files exist", (p: Project, world) => {
    return testFiles.every((f) => p.fileExists(f));
});

Given("the new Something source file already exists", (p: Project) => {
    p.addFile(sourceFiles[0], "stuff");
});
