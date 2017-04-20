import { HandleCommand, MappedParameters, Response, HandleResponse, HandlerContext, ResponseMessage, Respondable, Plan } from '@atomist/rug/operations/Handlers';
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Pattern } from '@atomist/rug/operations/RugOperation';
import * as PlanUtils from '@atomist/rugs/operations/PlanUtils';
import { handleErrors, GenericErrorHandler } from '@atomist/rugs/operations/CommonHandlers';


const standardLabels = [
    {
        name: "in-progress",
        color: "FF7F50"
    },
    {
        name: "up-next",
        color: "FFD750"
    },
    {
        name: "blocked",
        color: "C61D1D"
    }
]


@CommandHandler("AddStandardLabels", "Put org-standard labels on our repo")
@Tags("labels", "github", "satellite-of-love")
@Intent("add standard labels")
@Secrets("github://user_token?scopes=repo")
class AddStandardLabels implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    handle(command: HandlerContext): Plan {
        let plan = new Plan();

        standardLabels.forEach(sl => {
            let doThis = {
                instruction: {
                    kind: "command",
                    name: "AddRepoLabel",
                    parameters: {
                        ...sl,
                        repo: this.repo,
                        owner: this.owner
                    }
                }
               //,  onError: new ResponseMessage("whoops " + sl.name + " didn't work")
            };
            handleErrors(doThis, { msg: `Tried to add label ${sl.name}` });
            plan.add(new ResponseMessage("Adding label " + sl.name));
            plan.add(doThis);
        });

        return plan;
    }

}

export const errorHandler = new GenericErrorHandler();
export const addStandardLabels = new AddStandardLabels();
