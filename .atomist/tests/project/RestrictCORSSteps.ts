import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

When("RestrictCORS inputParameteristhe inputParameter value for RestrictCORS is added to your project by AddRestrictCORS", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let editor = psworld.editor("RestrictCORS");

    psworld.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("fileContains hello txt Hello Worldnot for RestrictCORS is added to your project by AddRestrictCORS", (p, world) => {

    return p.fileContains("hello.txt", "Hello, World!");
});
