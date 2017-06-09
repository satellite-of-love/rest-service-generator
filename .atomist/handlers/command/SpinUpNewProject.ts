import {
    CommandHandler, EventHandler, Intent, MappedParameter,
    Parameter, ParseJson, ResponseHandler, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, GitHubPullRequest, HandleCommand, HandlerContext,
    HandleResponse, MappedParameters, Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";
import * as DescribePerson from "./DescribePerson";
import { EnableTravisBuild } from "./EnableTravisBuild";

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
    })
    public path: string;

    public handle(context: HandlerContext): CommandPlan {

        if (this.path.match(/\/$/)) {
            // no trailing slash
            this.path = this.path.replace(/\/$/, "");
        }

        const addDeploymentSpec = {
            instruction: {
                kind: "edit", name: "AddDeploymentSpec",
                project: "atomist-k8-specs#satellite-of-love",
                parameters: {
                    service: this.repo,
                    path: this.path,
                },
                target: this.pr(this.repo, this.path),
                commitMessage: this.commitMessage(context, this.user, this.repo),
            },
            onSuccess: CommandPlan.ofMessage(
                new ResponseMessage("I made a PR to atomist-k8-specs. Please merge this after the build is set up")),
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
        return pr;
    }
}

export const spinUpNewProject = new SpinUpNewProject();
