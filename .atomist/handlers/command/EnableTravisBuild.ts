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
@Secrets("github://user_token?scopes=repo,read:org,user:email", "secret://team?path=/docker/token")
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
            encryptInstruction(this.repo, `GITHUB_TOKEN=#{github://user_token?scopes=repo}`);
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
        console.log("OK, here's the plan: " + JSON.stringify(plan))
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
@Secrets("github://user_token?scopes=repo", "secret://team?path=/docker/token")
class ReceiveGithubToken implements HandleResponse<any> {

    @Parameter(githubRepoParameter)
    public repo: string;

    public handle(response: Response<string>): CommandPlan {
        const plan = CommandPlan.ofMessage(
            new ResponseMessage("2: Encrypted Github Token for travis"));
        const encryptDockerToken = encryptInstruction(this.repo,
            `ATOMIST_REPO_TOKEN=#{secret://team?path=/docker/token}`);
        encryptDockerToken.onSuccess = ({
            kind: "respond", name: "ReceiveDockerToken",
            parameters: {
                repo: this.repo,
                encryptedGithubToken: response.body,
            },
        });
        plan.add(encryptDockerToken);
        return plan;
    }
}

@ResponseHandler("ReceiveDockerToken", "step 3")
@Secrets("github://user_token?scopes=repo")
class ReceiveDockerToken implements HandleResponse<any> {
    @Parameter(githubRepoParameter)
    public repo: string;

    @Parameter({
        displayName: "don't display this",
        description: "an encrypted githubn token to stick in a Travis file",
        pattern: Pattern.any,
        validInput: "long string of nonsense",
        minLength: 1,
        maxLength: 1000,
    })
    public encryptedGithubToken: string;

    public handle(response: Response<string>): CommandPlan {
        const encryptedDockerToken: string = response.body;
        const plan = CommandPlan.ofMessage(new ResponseMessage(`3: Encrypted Docker registry token for travis`));
        // this next one is not exactly secret but we don't want it scrapeable from the .travis.yml
        const encryptDockerUser = encryptInstruction(this.repo, `ATOMIST_REPO_USER=travis-docker`);
        encryptDockerUser.onSuccess = ({
            kind: "respond", name: "ReceiveDockerUser",
            parameters: {
                repo: this.repo,
                encryptedGithubToken: this.encryptedGithubToken,
                encryptedDockerToken,
            },
        });
        plan.add(encryptDockerUser);
        return plan;
    }
}

@ResponseHandler("ReceiveDockerUser", "step 4")
@Secrets("github://user_token?scopes=repo")
class ReceiveDockerUser implements HandleResponse<any> {
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

    @Parameter({
        displayName: "don't display this",
        description: "an encrypted docker token to stick in a Travis file",
        pattern: Pattern.any,
        validInput: "long string of nonsense",
        minLength: 1,
        maxLength: 1000,
    })
    public encryptedDockerToken: string;

    public handle(response: Response<string>): CommandPlan {
        const encryptedDockerUser: string = response.body;
        const plan = CommandPlan.ofMessage(new ResponseMessage("4: Encrypted Docker token for Travis"));
        const editorName = "PrepareTravisBuildFiles";
        const editorParameters = {
            project: this.repo,
            encryptedGithubToken: this.encryptedGithubToken,
            encryptedDockerRegistryToken: this.encryptedDockerToken,
            encryptedDockerRegistryUser: encryptedDockerUser,
        };
        const prepareBuildFiles = {
            instruction: {
                kind: "edit", name: editorName,
                project: this.repo,
                parameters: editorParameters,
            },
            onSuccess: CommandPlan.ofMessage(
                new ResponseMessage("5: Added Travis build files to the repository. Please accept my PR!")),
        };
        plan.add(prepareBuildFiles);
        return plan;
    }
}

export { EnableTravisBuild };
export const enableTravisBuild = new EnableTravisBuild();
export const receiveGithubToken = new ReceiveGithubToken();
export const receiveDockerToken = new ReceiveDockerToken();
export const receiveDockerUser = new ReceiveDockerUser();
