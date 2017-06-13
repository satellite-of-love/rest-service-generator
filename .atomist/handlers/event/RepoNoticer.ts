import {Repo, Commit} from "@atomist/cortex/stub/Types";
import * as stub from "@atomist/cortex/stub/Types";
import {EventHandler, Secrets} from "@atomist/rug/operations/Decorators";
import {
    ChannelAddress,
    DirectedMessage,
    EventPlan,
    EventRespondable,
    Execute,
    HandleEvent
} from "@atomist/rug/operations/Handlers";
import {GraphNode, Match} from "@atomist/rug/tree/PathExpression";
import {byExample} from "@atomist/rugs/util/tree/QueryByExample";

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
            if (match.matches.length > 0) {
                plan.add(new DirectedMessage(
                    `Repo ${root.name} has ${match.matches.length} labels based on ${printDammit(query)}`,
                    general));
            }
        } catch (e) {
            plan.add(
                new DirectedMessage(
                    `Exception in query ${printDammit(query)}: ${e.getMessage()}`, general));
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
                        name: name,
                        color: color,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `token #{secret://team?path=github_token}`,
                    },
                },
            },
        }
        , onSuccess: new DirectedMessage(
            "Added label " + name, new ChannelAddress(repo))
        , onError: {
            kind: "respond", name: "GenericErrorHandler", parameters:
            { msg: "Failed to add label " + name },
        },
    };

}

function printDammit(thing: any): string {

    function printDammitInternal(a: any): string[] {

        if (a === undefined) {
            return [`[actually undefined]`];
        }

        const js = JSON.stringify(a);
        if (js) {
            return [`${js}`];
        }

        const fnOrJava = a.toString();

        if (fnOrJava !== "[object Object]") {
            return [`toString(): ${fnOrJava}`];
        }

        // this is probably an inscrutable JVM object.

        let possibleMembers = [];
        for (const key in a) {
            possibleMembers = possibleMembers.concat([`${key}: `])
                .concat(printDammitInternal(a[key]).map((a) => " " + a));
        }
        return ["JVM{"].concat(possibleMembers).concat("}");
    }

    return printDammitInternal(thing).join("\n");
}

export function queryForLabels(repoName) {
    return byExample(new stub.ChatTeam().addOrgs(
        new stub.Org().addRepo(
            new stub.Repo().withName(repoName)
                .addLabels())));
}

export const repoNoticer = new RepoNoticer();
