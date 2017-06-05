import { ResponseMessage } from "@atomist/rug/operations/Handlers";
import {
    CommandHandlerScenarioWorld, Given, Then, When,
} from "@atomist/rug/test/handler/Core";

Given("nothing", (f) => { return; });

When("the Initiate is invoked", (w: CommandHandlerScenarioWorld) => {
    const handler = w.commandHandler("Initiate");
    w.invokeHandler(handler, {});
});

Then("you get the right response", (w: CommandHandlerScenarioWorld) => {
    const expected = "Successfully ran Initiate: default value";
    const message = (w.plan().messages[0] as ResponseMessage).body;
    return message === expected;
});
