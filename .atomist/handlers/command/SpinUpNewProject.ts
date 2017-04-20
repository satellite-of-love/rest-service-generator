import { HandleCommand, Response, HandleResponse, HandlerContext, ResponseMessage, Respondable, Plan, MappedParameters } from '@atomist/rug/operations/Handlers';
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Pattern } from '@atomist/rug/operations/RugOperation';
import * as PlanUtils from '@atomist/rugs/operations/PlanUtils';
import { EnableTravisBuild } from './EnableTravisBuild';


let githubRepoParameter = {
    displayName: "github repository",
    description: "a repository to enable builds on",
    pattern: Pattern.any,
    validInput: "repo name",
    minLength: 1,
    maxLength: 100
}

/**
 * A sample Rug TypeScript command handler.
 */
@CommandHandler("SpinUpNewProject", "Turn on the build in Travis, and set up deployment")
@Tags("documentation")
@Intent("spin me up")
@Secrets("github://user_token?scopes=repo", "secret://team?path=/docker/token")
export class SpinUpNewProject implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @Parameter({
        pattern: Pattern.any,
        validInput: "part-of-url",
        minLength: 1,
        maxLength: 100,
        displayName: "path from survey.atomist.com/ to this service",
        description: "url portion"
    })
    path: string;

    handle(command: HandlerContext): Plan {

        if (this.path.match(/\/$/)) {
            // no trailing slash
            this.path = this.path.replace(/\/$/, "")
        }

        let addDeploymentSpec: Respondable<any> = {
            instruction: {
                kind: "edit", name: "AddDeploymentSpec",
                project: "atomist-k8-specs#satellite-of-love",
                parameters: {
                    service: this.repo,
                    path: this.path
                }
            },
            onSuccess: Plan.ofMessage(new ResponseMessage("I made a PR to atomist-k8-specs. Please merge this after the build works")),
            onError: Plan.ofMessage(new ResponseMessage("Darn, the k8 edit didn't work"))
        };

        let enableTravisBuildHandler = new EnableTravisBuild();
        enableTravisBuildHandler.repo = this.repo;
        
        let plan = enableTravisBuildHandler.handle(command);
        plan.add(new ResponseMessage(`Oh goodie, I am going to make ${this.repo} have a Travis build and a deployment spec`))
        plan.add(addDeploymentSpec)

        return plan;

    }
}

export const spinUpNewProject = new SpinUpNewProject()