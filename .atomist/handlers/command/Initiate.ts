import {
    CommandHandler, Intent, MappedParameter, Parameter, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    ChannelAddress, CommandPlan, DirectedMessage,
    HandleCommand, HandlerContext, MappedParameters, ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * generate and spin up a new REST service.
 */
@CommandHandler("Initiate", "generate and spin up a new REST service")
@Tags("documentation")
@Secrets("secret://team?path=github_token")
@Intent("initiate creation sequence")
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

        const plan2 = new CommandPlan();
        // plan2.add(new ResponseMessage("Attempting to add a label"));
        // plan2.add(labelInstruction(this.owner, this.projectName));

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
                onSuccess: plan2,
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
                onSuccess:
                CommandPlan.ofMessage(new DirectedMessage(
                    `Ask atomist to "spin me up" to get this project into Travis`,
                    new ChannelAddress(this.projectName))),
            },
        });
        plan.add(new ResponseMessage(`Creating a new repo called ${this.projectName}`));
        return plan;
    }
}

function labelInstruction(owner: string, repo: string, labelName = "active", labelColor = "#ff2348") {

    const base = `https://api.github.com/repos/${owner}/${repo}`;

    return {
        instruction: {
            kind: "execute",
            name: "http",
            parameters: {
                url: `${base}/labels`,
                method: "post",
                config: {
                    body: JSON.stringify({
                        name: labelName,
                        color: labelColor,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `token #{secret://team?path=github_token}`,
                    },
                },
            },
        }
        , onSuccess: new DirectedMessage("Added label " + labelName, new ChannelAddress(repo)),
    };
}

export const initiate = new Initiate();
