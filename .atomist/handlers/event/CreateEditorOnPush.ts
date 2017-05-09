import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { ChannelAddress, DirectedMessage, EventPlan, HandleEvent } from "@atomist/rug/operations/Handlers";
import { Match } from "@atomist/rug/tree/PathExpression";

import { Push } from "@atomist/cortex/Push";

/**
 * A From a push, make an editor.
 */
@EventHandler("CreateEditorOnPush", "From a push, make an editor", "/Push()")
@Tags("documentation")
export class CreateEditorOnPush implements HandleEvent<Push, Push> {
    public handle(event: Match<Push, Push>): EventPlan {
        const root: Push = event.root;
        const message = new DirectedMessage(`${root.nodeName()} event received`, new ChannelAddress("#general"));
        return EventPlan.ofMessage(message);
    }
}

export const createEditorOnPush = new CreateEditorOnPush();
