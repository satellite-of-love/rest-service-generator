import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

When("AddRestEndpoint inputParameteristhe inputParameter value for AddRestEndpoint is added to your project by AddAddRestEndpoint", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let editor = psworld.editor("AddRestEndpoint");

    psworld.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("fileContains hello txt Hello Worldnot for AddRestEndpoint is added to your project by AddAddRestEndpoint", (p, world) => {

    return p.fileContains("hello.txt", "Hello, World!");
});
