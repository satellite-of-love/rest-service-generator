import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

/**
 * Sample TypeScript editor used by AddMyFirstEditor.
 */
@Editor("AddDeploymentSpec", "set up a satellite-of-love REST service on Travis")
@Tags("satellite-of-love", "k8")
export class AddDeploymentSpec implements EditProject {

    @Parameter({
        pattern: Pattern.any,
        validInput: "part-of-url",
        minLength: 1,
        maxLength: 100,
        displayName: "path from survey.atomist.com/ to this service",
        description: "url portion"
    })
    path: string;

    @Parameter({
        pattern: Pattern.project_name,
        validInput: "repo name",
        minLength: 1,
        maxLength: 200,
        displayName: "new project that would like to deploy",
        description: "repo name which is also service name"
    })
    service: string;

    edit(project: Project) {
        console.log(`Enabling deployment of ${this.service}`);

        if (project.name != "atomist-k8-specs") {
            throw `this doesn't work on ${project.name}, only on atomist-k8-specs`
        }

        project.describeChange(`Say hello to a new service, ${this.service}
        
        Merge this PR only after the Travis build has published some artifact for this service, please.`);

        let newServiceFile = `60-${this.service}-svc.json`
        if (!project.fileExists(newServiceFile)) {
            project.copyEditorBackingFileOrFailToDestination("60-new-service-svc.json",
                newServiceFile);
            project.findFile(newServiceFile).replace("new-service-path", this.path);
            project.findFile(newServiceFile).replace("new-service", this.service);
        }


        let newDeploymentFile = `80-${this.service}-deployment.json`
        if (!project.fileExists(newDeploymentFile)) {
            project.copyEditorBackingFileOrFailToDestination("80-new-service-deployment.json",
                newDeploymentFile);
            project.findFile(newDeploymentFile).replace("new-service", this.service);
        }
    }
}

export const addDeploymentSpec = new AddDeploymentSpec();
