import { File, Project } from "@atomist/rug/model/Core";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * Run this to copy Something into your project
 */
@Editor("SomethingLibbit", "Run this to copy Something into your project")
@Tags("libbit")
export class SomethingLibbit implements EditProject {

    public edit(project: Project) {

        const sourceFiles = [ "src/main/java/com/atomist/springrest/addrestendpoint/OneEndpointController.java" ];
        const testFiles = [];

        const allFiles = sourceFiles.concat(testFiles);

        const alreadyExisting = allFiles.filter((f) => project.fileExists(f));
        if (alreadyExisting.length > 0) {
            console.log(`File ${alreadyExisting.join(" and ")} already exists. Exiting`);
            return;
        }


        allFiles.forEach((f) => {
            project.copyEditorBackingFileOrFail(f);
        });

        // TODO: some atomist config operation to make a link
    }
}

export const sampleLibbit = new SomethingLibbit();
