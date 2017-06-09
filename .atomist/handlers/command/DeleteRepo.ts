import {
    CommandHandler, EventHandler, Intent,
    MappedParameter, Parameter, ParseJson,
    ResponseHandler, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, HandleCommand, HandlerContext,
    HandleResponse, MappedParameters, Response, ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";

/**
 * A sample Rug TypeScript command handler.
 */
@CommandHandler("DeleteRepo", "undo repo creation")
@Tags("danger", "github")
@Intent("delete repository yes i am sure")
@Secrets("github://user_token?scopes=repo,delete_repo")
class DeleteRepo implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    handle(command: HandlerContext): CommandPlan {
        const plan = new CommandPlan();

        const base = `https://api.github.com/repos/${this.owner}/${this.repo}`;

        plan.add(
            {
                instruction: {
                    kind: "execute",
                    name: "http",
                    parameters: {
                        url: `${base}`,
                        method: "delete",
                        config: {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `token #{github://user_token?scopes=repo,delete_repo}`,
                            },
                        },
                    },
                },
            },
        );
        return plan;
    }

}

export const label = new DeleteRepo();
