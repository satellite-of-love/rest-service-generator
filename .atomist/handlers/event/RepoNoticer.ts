import { HandleEvent, DirectedMessage, ChannelAddress, Plan } from '@atomist/rug/operations/Handlers';
import { Match } from '@atomist/rug/tree/PathExpression';
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators';
import { Repo } from "@atomist/cortex/stub/Repo";

@EventHandler("RepoNoticer", "does this work?", "/Repo()")
@Tags("repo")
export class RepoNoticer implements HandleEvent<Repo, Repo> {
    handle(event: Match<Repo, Repo>): Plan {
        let root: Repo = event.root();
        let message = new DirectedMessage(`A new ${root.nodeName()} has appeared: ${root.name} ${root.labels}`, new ChannelAddress("general"));
        return Plan.ofMessage(message);
    }
}

export const repoNoticer = new RepoNoticer();
