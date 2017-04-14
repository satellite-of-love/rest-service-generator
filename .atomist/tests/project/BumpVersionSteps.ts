import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

When("BumpVersion inputParameteristhe inputParameter value for BumpVersion is added to your project by AddBumpVersion", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let editor = psworld.editor("BumpVersion");

    psworld.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("fileContains hello txt Hello Worldnot for BumpVersion is added to your project by AddBumpVersion", (p, world) => {

    return p.fileContains("hello.txt", "Hello, World!");
});
