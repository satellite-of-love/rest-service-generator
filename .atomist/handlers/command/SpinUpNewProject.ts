import {
    CommandHandler, EventHandler, Intent, MappedParameter,
    Parameter, ParseJson, ResponseHandler, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, GitHubPullRequest, HandleCommand, HandlerContext,
    HandleResponse, MappedParameters, Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";
import * as DescribePerson from "./DescribePerson";
import {EnableTravisBuild} from "./EnableTravisBuild";

import * as stub from "@atomist/cortex/stub/Types";

import {byExample} from "@atomist/rugs/util/tree/QueryByExample";

const githubRepoParameter = {
    displayName: "github repository",
    description: "a repository to enable builds on",
    pattern: Pattern.any,
    validInput: "repo name",
    minLength: 1,
    maxLength: 100,
};

/**
 * A sample Rug TypeScript command handler.
 */
@CommandHandler("SpinUpNewProject", "Turn on the build in Travis, and set up deployment")
@Tags("documentation")
@Intent("spin me up")
@Secrets("github://user_token?scopes=repo,read:org,user:email", "secret://team?path=/docker/token")
export class SpinUpNewProject implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.SLACK_USER)
    public user: string;

    @Parameter({
        pattern: Pattern.any,
        validInput: "part-of-url",
        minLength: 1,
        maxLength: 100,
        displayName: "path from survey.atomist.com/ to this service",
        description: "url portion",
        required: false
    })
    public path: string = "-same-as-project-name-";

    public handle(context: HandlerContext): CommandPlan {

        const path = this.path.match(/\/$/) ?
            this.path.replace(/\/$/, "") :
            (this.path === "-same-as-project-name-" ?
                this.repo : this.path)


        const addDeploymentSpec = {
            instruction: {
                kind: "edit", name: "AddDeploymentSpec",
                project: "atomist-k8-specs",
                parameters: {
                    service: this.repo,
                    path: path,
                },
                target: this.pr(this.repo, path),
                commitMessage: this.commitMessage(context, this.user, this.repo),
            },
            onSuccess: CommandPlan.ofMessage(
                new ResponseMessage(
                    `I made a PR to <https://github.com/satellite-of-love/atomist-k8-specs|atomist-k8-specs>. Merge this to get deployments`)),
            onError: CommandPlan.ofMessage(
                new ResponseMessage("Darn, the k8 edit didn't work")),
        };

        const enableTravisBuildHandler = new EnableTravisBuild();
        enableTravisBuildHandler.repo = this.repo;

        const plan = enableTravisBuildHandler.handle(context);
        plan.add(
            new ResponseMessage(
                `Oh goodie, I am going to make ${this.repo} have a Travis build and a deployment spec`));
        plan.add(addDeploymentSpec);

        return plan;

    }


    private commitMessage(context: HandlerContext, user: string, projectName: string): string {
        const person = DescribePerson.describePerson(
            context.pathExpressionEngine, context.contextRoot, user);

        return `Add deploy spec for service ${projectName}

Commit by atomist, triggered by ${DescribePerson.identifyOnGitHub(person)}`;
    }

    private pr(projectName, path): GitHubPullRequest {
        const pr = new GitHubPullRequest("satellite-of-love");
        pr.title = `Deploy new service ${projectName} at /${path}`;
        pr.body = `Once you merge this, ${projectName} will deploy at its next successful Travis build`;
        pr.headBranch = `spin-up-${projectName}`;
        pr.baseBranch = `satellite-of-love`;
        return pr;
    }
}

export const spinUpNewProject = new SpinUpNewProject();
