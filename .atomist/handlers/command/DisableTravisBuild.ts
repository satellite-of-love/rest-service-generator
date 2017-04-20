import { HandleCommand, Response, HandleResponse, MappedParameters,  HandlerContext, ResponseMessage, Respondable, Plan } from '@atomist/rug/operations/Handlers';
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Pattern } from '@atomist/rug/operations/RugOperation';
import * as PlanUtils from '@atomist/rugs/operations/PlanUtils';



@CommandHandler("DisableTravisBuild", "Turn on a build in Travis, and set up a REST build")
@Tags("travis")
@Intent("disable travis build")
@Secrets("github://user_token?scopes=repo")
class DisableTravisBuild implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    handle(command: HandlerContext): Plan {
        console.log(`We would like to turn on builds for ${this.repo}`);

        let executeTravisDisableRepo = PlanUtils.execute("travis-disable-repo",
            {
                repo: this.repo,
                owner: "satellite-of-love",
                org: ".org"
            }
        );
        executeTravisDisableRepo.onSuccess = new ResponseMessage("OK! Goodbye travis build!");

        let message = new ResponseMessage(`Disabling travis build...`);
        let plan = Plan.ofMessage(message);
        plan.add(executeTravisDisableRepo);
        return plan;
    }


}

export const disableTravisBuild = new DisableTravisBuild();
