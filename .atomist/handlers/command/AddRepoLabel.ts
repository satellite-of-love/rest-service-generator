import { HandleCommand, MappedParameters, Response, HandleResponse, HandlerContext, ResponseMessage, CommandPlan } from '@atomist/rug/operations/Handlers';
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Pattern } from '@atomist/rug/operations/RugOperation';
import * as PlanUtils from '@atomist/rugs/operations/PlanUtils';

/**
 * A sample Rug TypeScript command handler.
 */
@CommandHandler("AddRepoLabel", "Make it possible to add this new label to an issue in this repo")
@Tags("labels", "github")
@Intent("add repo label")
@Secrets("github://user_token?scopes=repo")
class AddRepoLabel implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    @Parameter({ description: "GitHub repo label name. lowercase, dashes, colons", pattern: "^[a-z-:]+$" })
    name: string;

    @Parameter({ description: "GitHub repo color (hex)", pattern: "^#?[A-Fa-f0-9]{6}$" })
    color: string = "f29513";

    handle(command: HandlerContext): CommandPlan {
        let plan = new CommandPlan();

        const base = `https://api.github.com/repos/${this.owner}/${this.repo}`;

        plan.add(
            {
                instruction: {
                    kind: "execute",
                    name: "http",
                    parameters: {
                        url: `${base}/labels`,
                        method: "post",
                        config: {
                            body: JSON.stringify({
                                "name": this.name,
                                "color": this.color
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `token #{github://user_token?scopes=repo}`,
                            },
                        }
                    }
                },
                onSuccess: new ResponseMessage(`Defined label ${this.name}`),
            }
        );
        return plan;
    }


}

export const label = new AddRepoLabel();
