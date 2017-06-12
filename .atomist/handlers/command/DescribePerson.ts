import { ChatId, ChatTeam, GitHubId, Person } from "@atomist/cortex/stub/Types";
import { GraphNode, PathExpressionEngine } from "@atomist/rug/tree/PathExpression";

export interface DescribedPerson {

    slackUserId: string;
    slackUsername: string;
    gitHubLogin?: string;
    name: string;

}

export function identifyOnGitHub(p: DescribedPerson): string {
    if (p.gitHubLogin) {
        return "@" + p.gitHubLogin;
    } else {
        return `${p.name} (${p.slackUsername} on slack)`;
    }
}

function constructName(p: Person) {
    if (p.forename.length === 0) {
        return p.surname;
    }
    if (p.surname.length === 0) {
        return p.surname;
    }
    return `${p.forename} ${p.surname}`;
}

/**
 * For testing
 *
 * In command handler test setup, call `world.setRootContext(team)`
 * where team is the output of this function
 * @param p
 * @param chatTeam
 */
export function fakePerson(p: DescribedPerson, chatTeam: ChatTeam = new ChatTeam()): ChatTeam {
    chatTeam.addMembers(
        new ChatId().withId(p.slackUserId).withScreenName(p.slackUsername).withPerson(
            new Person().withForename(p.name).withGitHubId(
                new GitHubId().withLogin(p.gitHubLogin))));
    return chatTeam;
}

/**
 * Run a path expression to get info about a person
 *
 * @param pxe
 * @param chatTeam this is typed as GraphNode to make it easier to call from CommandHandlers.
 * @param slackUserId
 */
export function describePerson(
    pxe: PathExpressionEngine,
    chatTeam: GraphNode,
    slackUserId: string): DescribedPerson {
    try {
        const match = pxe.evaluate<ChatTeam, ChatId>(
            chatTeam as ChatTeam,
            `/ChatTeam()/members::ChatId()[@id='${this.requester}'][/person::Person()[/gitHubId::GitHubId()]?]`,
        );

        if (match.matches.length >= 1) {
            const chatId = match.matches[0];
            const slackUsername = chatId.screenName;
            const name = constructName(chatId.person);
            const gitHubLogin = chatId.person.gitHubId ? chatId.person.gitHubId.login : null;

            return {
                slackUserId, slackUsername, name, gitHubLogin,
            };
        } else {
            const match = pxe.evaluate<ChatTeam, ChatId>(
                chatTeam as ChatTeam,
                `/ChatTeam()/members::ChatId()[@id='${this.requester}']`,
            );
            if (!match || !match.matches || match.matches.length == 0) {
                throw new Error(`I can't even retrieve the ChatId for ${slackUserId} from ${chatTeam.nodeName()}`);
            } else {
                const match = pxe.evaluate<ChatTeam, ChatId>(
                    chatTeam as ChatTeam,
                    `/ChatTeam()/members::ChatId()[@id='${this.requester}'][/person::Person()]`,
                );
                if (!match || !match.matches || match.matches.length == 0) {
                    throw new Error(`I can't find a Person for ${slackUserId}`);
                } else {
                    const chatId = match.matches[0];
                    const slackUsername = chatId.screenName;
                    const name = constructName(chatId.person)
                    console.log("Guess that optional test wasn't so optional");

                    return {
                        slackUserId, slackUsername, name,
                    };
                }
            }
        }


    } catch (e) {
        console.log(`Failure: Unable to retrieve personal info for Slack user ${slackUserId}: ${printException(e)}`);
        throw e;
    }
}

// I don't know really how to do this well. It's probably a JVM exception
function printException(a: any): string {
    if (a.getMessage) {
        return `toString(): ${a.getMessage()}`;
    } else {
        return a.message;
    }
}
