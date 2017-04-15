import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

When("UpgradeDockerfile inputParameteristhe inputParameter value for UpgradeDockerfile is added to your project by AddUpgradeDockerfile", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let editor = psworld.editor("UpgradeDockerfile");

    psworld.editWith(editor, { inputParameter: "the inputParameter value" });
});

Then("fileContains hello txt Hello Worldnot for UpgradeDockerfile is added to your project by AddUpgradeDockerfile", (p, world) => {

    return p.fileContains("hello.txt", "Hello, World!");
});
