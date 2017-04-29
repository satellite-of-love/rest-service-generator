import { HandleEvent, DirectedMessage, ChannelAddress, EventPlan, EventRespondable, Execute } from '@atomist/rug/operations/Handlers';
import { Match } from '@atomist/rug/tree/PathExpression';
import { EventHandler, Tags, Secrets } from '@atomist/rug/operations/Decorators';
import { Repo } from "@atomist/cortex/stub/Repo";
import { Label } from "@atomist/cortex/stub/Label";
import * as PlanUtils from '@atomist/rugs/operations/PlanUtils';
import { byExample } from "@atomist/rugs/util/tree/QueryByExample";

@EventHandler("RepoNoticer", "does this work?", "/Repo()/Labels()")
@Tags("repo")
@Secrets("secret://team?path=github_token")
export class RepoNoticer implements HandleEvent<Repo, Repo> {
    handle(event: Match<Repo, Repo>): EventPlan {
        let plan = new EventPlan();
        let root: Repo = event.root;
        let message = new DirectedMessage(`A new ${root.nodeName()} has appeared: ${root.name} ${root.labels}`, new ChannelAddress("general"));
        plan.add(message)
        plan.add(addLabelInstruction(root.owner, root.name, "in-progress", ""))
        return plan;
    }
}

function addLabelInstruction(owner: string, repo: string, name: string, color: string): EventRespondable<Execute> {
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
                        "name": this.name,
                        "color": this.color
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `token #{secret://team?path=github_token}`,
                    }
                }
            }
        }
        , onSuccess: new DirectedMessage("Added label " + name, new ChannelAddress(repo))
    };

}

export const repoNoticer = new RepoNoticer();
