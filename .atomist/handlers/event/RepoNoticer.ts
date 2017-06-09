import { Label } from "@atomist/cortex/stub/Label";
import { Repo } from "@atomist/cortex/stub/Repo";
import * as stub from "@atomist/cortex/stub/Types";
import { EventHandler, Secrets, Tags } from "@atomist/rug/operations/Decorators";
import {
    ChannelAddress, DirectedMessage, EventPlan, EventRespondable,
    Execute, HandleEvent,
} from "@atomist/rug/operations/Handlers";
import { GraphNode, Match } from "@atomist/rug/tree/PathExpression";
import * as CommonHandlers from "@atomist/rugs/operations/CommonHandlers";
import * as PlanUtils from "@atomist/rugs/operations/PlanUtils";
import { byExample } from "@atomist/rugs/util/tree/QueryByExample";

@EventHandler("RepoNoticer", "does this work?", "/Repo()")
@Secrets("secret://team?path=github_token")
export class RepoNoticer implements HandleEvent<Repo, Repo> {
    public handle(event: Match<Repo, Repo>): EventPlan {
        const general = new ChannelAddress("general");
        const plan = new EventPlan();
        const root: Repo = event.root;
        const message = new DirectedMessage(
            `A new ${root.nodeName()} has appeared: ${root.name}`,
            general);
        plan.add(message);

        const query = queryForLabels(root.name);
        try {
            const match = event.pathExpressionEngine.evaluate(
                {} as GraphNode, // this arg is ignored
                query);
            plan.add(new DirectedMessage(
                `Repo ${root.name} has ${match.matches.length} labels based on ${query}`,
                general));
        } catch (e) {
            plan.add(
                new DirectedMessage(
                    `Exception in query ${query}: ${e.getMessage()}`, general));
        }

        plan.add(
            addLabelInstruction(root.owner, root.name, "in-progress", ""));
        return plan;
    }
}

export function addLabelInstruction(
    owner: string, repo: string, name: string, color: string):
    EventRespondable<Execute> {

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
                        name: this.name,
                        color: this.color,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `token #{secret://team?path=github_token}`,
                    },
                },
            },
        }
        , onSuccess: new DirectedMessage("Added label " + name, new ChannelAddress(repo)),
        onError: {
            kind: "respond", name: "GenericErrorHandler", parameters:
            { msg: "Failed to add label " + name },
        },
    };

}

export function queryForLabels(repoName) {
    return byExample(new stub.ChatTeam().addOrgs(
        new stub.Org().addRepo(
            new stub.Repo().withName(repoName)
                .addLabels())));
}

export const repoNoticer = new RepoNoticer();
