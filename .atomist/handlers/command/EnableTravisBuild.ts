import {
    CommandHandler,
    EventHandler,
    Intent,
    MappedParameter,
    Parameter,
    ParseJson,
    ResponseHandler,
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan,
    GitHubPullRequest,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import * as CommonHandlers from "@atomist/rugs/operations/CommonHandlers";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";

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
@CommandHandler("EnableTravisBuild", "Turn on a build in Travis, and set up a REST build")
@Tags("travis", "satellite-of-love")
@Intent("run EnableTravisBuild")
@Secrets("github://user_token?scopes=repo,read:org,user:email",
    "secret://team?path=/docker/token",
    "secret://team?path=travisci_github_token",
    "secret://team?path=maven_token",
    "secret://team?path=maven_user")
class EnableTravisBuild implements HandleCommand {

    @Parameter(githubRepoParameter)
    public repo: string;

    @MappedParameter("atomist://correlation_id")
    private corrid: string;

    public handle(command: HandlerContext): CommandPlan {
        console.log(`We would like to turn on builds for ${this.repo}`);

        const executeTravisEnableRepo = CommonHandlers.handleErrors(PlanUtils.execute("travis-enable-repo",
            {
                repo: this.repo,
                owner: "satellite-of-love",
                org: ".org",
            }), { msg: "Grrr", corrid: this.corrid });
        const encryptGithubSecret =
            encryptInstruction(this.repo, `GITHUB_TOKEN=#{github://user_token?scopes=repo,read:org,user:email}`);
        encryptGithubSecret.onSuccess = (
            {
                kind: "respond",
                name: "ReceiveGithubToken",
                parameters: { repo: this.repo },
            });

        const encryptSecretsAndAddBuildFiles = new CommandPlan();
        encryptSecretsAndAddBuildFiles.add(encryptGithubSecret);
        encryptSecretsAndAddBuildFiles.add(new ResponseMessage(`1: Enabled build for ${this.repo} on travis-ci.org`));
        executeTravisEnableRepo.onSuccess = encryptSecretsAndAddBuildFiles;
        // CommonHandlers.handleErrors(executeTravisEnableRepo, "Failure enabling build on Travis.")

        const message = new ResponseMessage(`There are 5 steps to enabling a Travis build:`);
        const plan = CommandPlan.ofMessage(message);
        plan.add(executeTravisEnableRepo);
        console.log("OK, here's the plan: " + JSON.stringify(plan));
        return plan;
    }

}

function encryptInstruction(repo: string, content: string) {
    return PlanUtils.execute("travis-encrypt",
        {
            repo,
            owner: "satellite-of-love",
            org: ".org",
            content,
        },
    );
}

@ResponseHandler("ReceiveGithubToken", "step 2")
@Secrets("github://user_token?scopes=repo,read:org,user:email",
    "secret://team?path=/pivotal/password")
class ReceiveGithubToken implements HandleResponse<any> {

    @Parameter(githubRepoParameter)
    public repo: string;

    public handle(response: Response<string>): CommandPlan {
        const plan = CommandPlan.ofMessage(
            new ResponseMessage("2: Encrypted Pivotal password for travis"));
        const encryptPivotalPassword = encryptInstruction(this.repo,
            `#{secret://team?path=/pivotal/password}`);
        encryptPivotalPassword.onSuccess = ({
            kind: "respond", name: "ReceivePivotalPassword",
            parameters: {
                repo: this.repo,
                encryptedGithubToken: response.body,
            },
        });
        plan.add(encryptPivotalPassword);
        return plan;
    }
}

@ResponseHandler("ReceivePivotalPassword", "step 3")
@Secrets("github://user_token?scopes=repo,read:org,user:email")
class ReceivePivotalPassword implements HandleResponse<any> {
    @Parameter(githubRepoParameter)
    public repo: string;

    @Parameter({
        displayName: "don't display this",
        description: "an encrypted github token to stick in a Travis file",
        pattern: Pattern.any,
        validInput: "long string of nonsense",
        minLength: 1,
        maxLength: 1000,
    })
    public encryptedGithubToken: string;

    public handle(response: Response<string>): CommandPlan {
        const encryptedPivotalPassword: string = response.body;
        const plan = CommandPlan.ofMessage(new ResponseMessage("3: Encrypted Pivotal password for Travis"));
        const editorName = "PrepareTravisBuildFiles";
        const editorParameters = {
            project: this.repo,
            encryptedGithubToken: this.encryptedGithubToken,
            encryptedPivotalPassword,
        };
        const prepareBuildFiles = {
            instruction: {
                kind: "edit", name: editorName,
                project: this.repo,
                parameters: editorParameters,
            },
            target: this.pr(this.repo),
            commitMessage: this.commitMessage(),
            onSuccess: CommandPlan.ofMessage(
                new ResponseMessage("4: Added Travis build files to the repository. Please accept my PR!")),
        };
        plan.add(prepareBuildFiles);
        return plan;
    }

    private commitMessage(): string {
        return `Add Travis build configuration`;
    }

    private pr(projectName): GitHubPullRequest {
        const pr = new GitHubPullRequest();
        pr.title = `Travis, do the thing!`;
        pr.body = `Travis build files for maven and cloud foundry`;
        pr.headBranch = "travis-build-files";
        return pr;
    }
}

export { EnableTravisBuild };
export const enableTravisBuild = new EnableTravisBuild();
export const receiveGithubToken = new ReceiveGithubToken();
export const receiveDockerToken = new ReceivePivotalPassword();

