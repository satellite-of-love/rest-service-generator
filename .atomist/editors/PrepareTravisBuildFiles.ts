import { Pom } from "@atomist/rug/model/Pom";
import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { PathExpressionEngine } from "@atomist/rug/tree/PathExpression";

const encryptedTokenParameterValidation = {
    pattern: Pattern.any,
    validInput: "alphanumeric",
    minLength: 1,
    maxLength: 1000,
};
/**
 * Sample TypeScript editor used by AddMyFirstEditor.
 */
@Editor("PrepareTravisBuildFiles", "set up a satellite-of-love REST service on Travis")
@Tags("satellite-of-love", "travis")
export class PrepareTravisBuildFiles implements EditProject {

    @Parameter({
        ...encryptedTokenParameterValidation,
        displayName: "encrypted github token",
        description: "travis-encrypted GI	THUB_TOKEN=...",
    })
    public encryptedGithubToken: string;

    @Parameter({
        ...encryptedTokenParameterValidation,
        displayName: "encrypted pivotal password",
        description: "travis-encrypted password",
    })
    public encryptedPivotalPassword: string;

    public edit(project: Project) {
        console.log(`Enabling build on ${project.name}`);

        // .travis.yml
        if (project.fileExists(".travis.yml")) {
            project.deleteFile(".travis.yml");
        }
        project.copyEditorBackingFileOrFail(".travis.yml");

        // replace all secrets
        const travisFile = project.findFile(".travis.yml");
        const newContent = travisFile.content.replace(
            /\n.*- secure: .*\n/g, "\n").replace(
            "  global:",
            `  global:
  - secure: ${this.encryptedGithubToken}`).replace(
            "PIVOTAL_PASSWORD_HERE", this.encryptedPivotalPassword);
        travisFile.setContent(newContent);

        // build script
        if (!project.fileExists("src/main/scripts/travis-build.bash")) {
            project.copyEditorBackingFileOrFail("src/main/scripts/travis-build.bash");
        }

        // copy manifest.yml, populate application name
        if (!project.fileExists("manifest.yml")) {
            project.copyEditorBackingFileOrFail("manifest.yml");

            const manifest = project.findFile("manifest.yml");
            manifest.setContent(manifest.content.replace("rest-service-generator", project.name));
        }

    }
}

export const prepareTravisBuildFiles = new PrepareTravisBuildFiles();
