import { HandleCommand, HandlerContext, ResponseMessage, Plan } from '@atomist/rug/operations/Handlers';
import { CommandHandler, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators';
import { Pattern } from '@atomist/rug/operations/RugOperation';

/**
 * A run an editor to add a REST endpoint to this project.
 */
@CommandHandler("AddRestEndpointPlease", "run an editor to add a REST endpoint to this project")
@Tags("documentation")
@Intent("add endpoint")
export class AddRestEndpointPlease implements HandleCommand {

    @Parameter({
        displayName: "Some Input",
        description: "example of how to specify a parameter using decorators",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
        minLength: 1,
        maxLength: 100,
        required: false
    })
    inputParameter: string = "default value";

    handle(command: HandlerContext): Plan {
        let message = new ResponseMessage(`Successfully ran AddRestEndpointPlease: ${this.inputParameter}`);
        return Plan.ofMessage(message);
    }
}

export const addRestEndpointPlease = new AddRestEndpointPlease();
