import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

@Editor("ChangePortNumber", "change the port number of a service")
@Tags("spring", "satellite-of-love", "jess")
export class ChangePortNumber implements EditProject {

    @Parameter({
        displayName: "Current port number",
        description: "where is it now?",
        pattern: Pattern.any,
        validInput: "digits",
        minLength: 1,
        maxLength: 6,
        required: false
    })
    before: string = "8080";

      @Parameter({
        displayName: "New port number",
        description: "where should it be?",
        pattern: Pattern.any,
        validInput: "digits",
        minLength: 1,
        maxLength: 6
    })
    after: string;

    edit(project: Project) {
        // there are a few places I know to look
        let dockerfile = project.findFile("src/main/docker/Dockerfile");
        dockerfile.replace(`EXPOSE ${this.before}`, `EXPOSE ${this.after}`);

        let applicationProperties = project.findFile("src/main/resources/application.properties");
        applicationProperties.replace(`server.port=${this.before}`, `server.port=${this.after}`);

        // and anywhere it appears in tests
        let pxe = project.context.pathExpressionEngine;
        pxe.with<File>(project, "/src/test//File()", f => {
            f.replace(this.before, this.after);
        })
    }

}

export const changePortNumber = new ChangePortNumber();
