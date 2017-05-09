import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { ChannelAddress, DirectedMessage, EventPlan, HandleEvent } from "@atomist/rug/operations/Handlers";
import { Match } from "@atomist/rug/tree/PathExpression";

import { Push } from "@atomist/cortex/Push";
import { Impact } from "@atomist/rug/model/Impact";

/**
 * From a push, make an editor.
 */
@EventHandler("CreateEditorOnPush", "From a push, make an editor", "/Push()[/after::Commit()][/before::Commit()]")
@Tags("documentation")
export class CreateEditorOnPush implements HandleEvent<Push, Impact> {
    public handle(event: Match<Push, Impact>): EventPlan {
        const root: Push = event.root;
        console.log(`The push has ${root.after} and ${root.before} on ${root.branch}`)

        const impact = event.pathExpressionEngine.scalar<Push, Impact>(root, "/with::Impact()")

        const filesChanged = impact.changed.files.map(f => f.path).join("\n")
        const message = new DirectedMessage(`${root.nodeName()} event received.
        The impact says these files were changed:
        ${filesChanged}`, new ChannelAddress("#general"));
        return EventPlan.ofMessage(message);
    }
}

export const createEditorOnPush = new CreateEditorOnPush();
