import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";

When("NewRestService for NewRestService should create a new project based on this archive", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let generator = psworld.generator("NewRestService");

    psworld.generateWith(generator, "new-test-project", {});
});

Then("fileExists README md for NewRestService should create a new project based on this archive", (p, world) => {

    return p.fileExists("README.md");
});
