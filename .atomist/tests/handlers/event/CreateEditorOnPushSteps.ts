import { DirectedMessage } from "@atomist/rug/operations/Handlers";
import {
    EventHandlerScenarioWorld, Given, Then, When,
} from "@atomist/rug/test/handler/Core";

import { Push } from "@atomist/cortex/stub/Push";

Given("the CreateEditorOnPush is registered", (w: EventHandlerScenarioWorld) => {
    w.registerHandler("CreateEditorOnPush");
});

When("a new Push is received", (w: EventHandlerScenarioWorld) => {
    const event = new Push();
    w.sendEvent(event);
});

Then("the CreateEditorOnPush event handler should respond with the correct message",
    (w: EventHandlerScenarioWorld) => {
        const expected = `Push event received`;
        const message = (w.plan().messages[0] as DirectedMessage).body;
        return message === expected;
    },
);
