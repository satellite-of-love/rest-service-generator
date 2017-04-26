import { HandleEvent, DirectedMessage, ChannelAddress, EventPlan } from '@atomist/rug/operations/Handlers';
import { Match } from '@atomist/rug/tree/PathExpression';
import { EventHandler, Tags, Secrets } from '@atomist/rug/operations/Decorators';
import { Repo } from "@atomist/cortex/stub/Repo";
import { Label } from "@atomist/cortex/stub/Label";
import { byExample } from "@atomist/rugs/util/tree/QueryByExample";

@EventHandler("RepoNoticer", "does this work?", byExample(new Repo().addLabels(new Label())))
@Tags("repo")
@Secrets("github://user_token?scopes=repo")
export class RepoNoticer implements HandleEvent<Repo, Repo> {
    handle(event: Match<Repo, Repo>): EventPlan {
        let root: Repo = event.root();
        let message = new DirectedMessage(`A new ${root.nodeName()} has appeared: ${root.name} ${root.labels}`, new ChannelAddress("general"));
        return EventPlan.ofMessage(message);
    }
}

export const repoNoticer = new RepoNoticer();
