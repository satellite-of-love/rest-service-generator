import { HandleCommand, HandlerContext, MappedParameters, GitHubPullRequest, ResponseMessage, CommandPlan } from '@atomist/rug/operations/Handlers';
import { CommandHandler, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import * as CommonHandlers from "@atomist/rugs/operations/CommonHandlers";

/**
 * A run an editor to add a REST endpoint to this project.
 */
@CommandHandler("AddRestEndpointPlease", "run an editor to add a REST endpoint to this project")
@Tags("satellite-of-love", "rest")
@Intent("add endpoint")
export class AddRestEndpointPlease implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @Parameter({
        displayName: "Java return type",
        description: "type the endpoint will return",
        pattern: Pattern.java_class,
        validInput: "Java class name like ThunderCougarFalconBird",
        minLength: 1,
        maxLength: 100
    })
    returnedClass: string;

    @Parameter({
        displayName: "pojo field name",
        description: "name of a field in your pojo, blank for none (or not a new pojo)",
        pattern: Pattern.java_identifier,
        validInput: "Java identifier",
        minLength: 1,
        maxLength: 100
    })
    fieldName: string = "";

    @Parameter({
        displayName: "pojo field type",
        description: "type of that field in your pojo, blank for none (or not a new pojo)",
        pattern: Pattern.any,
        validInput: "Java type",
        minLength: 1,
        maxLength: 100
    })
    fieldType: string = "";

    handle(command: HandlerContext): CommandPlan {
        const branchName = `add-${this.returnedClass}-endpoint`
        const pr = new GitHubPullRequest();
        pr.title = `Add a new endpoint to return a ${this.returnedClass}`;
        pr.headBranch = branchName;

        let edit = CommonHandlers.wrap({
            instruction: {
                kind: "edit", name: "AddRestEndpoint",
                project: this.repo, parameters: this,
                target: pr
            },
        }, `I made a PR. Check out ${branchName} to work on it`);

        return new CommandPlan().add(edit);
    }
}

export const addRestEndpointPlease = new AddRestEndpointPlease();
