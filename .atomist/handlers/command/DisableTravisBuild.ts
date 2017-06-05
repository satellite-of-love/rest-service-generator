import {
    CommandHandler, EventHandler, Intent,
    MappedParameter, Parameter, ParseJson, ResponseHandler, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, HandleCommand, HandlerContext,
    HandleResponse, MappedParameters, Response, ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("DisableTravisBuild", "Turn on a build in Travis, and set up a REST build")
@Tags("travis")
@Intent("disable travis build")
@Secrets("github://user_token?scopes=repo")
class DisableTravisBuild implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    handle(command: HandlerContext): CommandPlan {
        console.log(`We would like to turn on builds for ${this.repo}`);

        const executeTravisDisableRepo = PlanUtils.execute("travis-disable-repo",
            {
                repo: this.repo,
                owner: "satellite-of-love",
                org: ".org",
            },
        );
        executeTravisDisableRepo.onSuccess = new ResponseMessage("OK! Goodbye travis build!");

        const message = new ResponseMessage(`Disabling travis build...`);
        const plan = CommandPlan.ofMessage(message);
        plan.add(executeTravisDisableRepo);
        return plan;
    }

}

export const disableTravisBuild = new DisableTravisBuild();
