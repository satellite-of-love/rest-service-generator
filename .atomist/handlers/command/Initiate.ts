import {
    CommandHandler, Intent, MappedParameter, Parameter, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, HandleCommand, HandlerContext,
    MappedParameters, ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * generate and spin up a new REST service.
 */
@CommandHandler("Initiate", "generate and spin up a new REST service")
@Tags("documentation")
@Intent("create rest service")
export class Initiate implements HandleCommand {

    @Parameter({
        displayName: "Name for the new service",
        description: "project name",
        pattern: Pattern.any,
        validInput: "valid git repo and maven artifactId",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public projectName: string;

    @Parameter({
        displayName: "Project Description",
        description: "short descriptive text describing the new project",
        pattern: Pattern.any,
        validInput: "free text",
        minLength: 1,
        maxLength: 100,
        required: false,
    })
    public description: string = "Mystery Project";

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter(MappedParameters.SLACK_USER)
    public userId: string;

    @MappedParameter(MappedParameters.SLACK_TEAM)
    public teamId: string;

    @MappedParameter("atomist://correlation_id")
    public correlationId: string;

    public handle(context: HandlerContext): CommandPlan {
        // Create the repo on GitHub. After that, enable the Travis build.
        // And create a PR for atomist-k8-specs
        const plan = new CommandPlan();
        plan.add({
            instruction: {
                kind: "generate",
                project: this.projectName,
                name: "NewRestService",
                parameters: {
                    description: this.description,
                    owner: this.owner, // is this necessary?
                    correlationId: this.correlationId, // is this necessary?
                    visibility: "public",
                },
            },
        });
        plan.add({
            instruction: {
                kind: "execute",
                name: "raise-new-repo-event",
                parameters: {
                    project: this.projectName,
                    userId: this.userId,
                },
            },
        });
        plan.add(new ResponseMessage(`Creating a new repo called ${this.projectName}`));
        return plan;
    }
}

export const initiate = new Initiate();
