import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import * as RugGeneratorFunctions from '../generators/RugGeneratorFunctions';
import { RichTextTreeNode } from '@atomist/rug/ast/TextTreeNodeOps';
import { TextTreeNode, PointFormatInfo, FormatInfo } from '@atomist/rug/tree/PathExpression';
import * as TreeHelper from '@atomist/rug/tree/TreeHelper';

@Editor("Play", "learn about editors")
@Tags("satellite-of-love", "jess")
export class Play implements EditProject {

    edit(project: Project) {
        let positionOfInterest: Position = { line: 24, column: 6, };
        let endPositionOfInterest: Position = { line: 37, column: 1 };

        let identifierPosition: Position = { line: 25, column: 17 }

        let grammarPX = "/JavaFile()"

        let filepathOfInterest = "src/test/java/com/atomist/springrest/addrestendpoint/OneEndpointWebIntegrationTests.java";
        let fileOfInterest = project.findFile(filepathOfInterest);
        if (fileOfInterest == null) {
            throw `File not found: ${filepathOfInterest}`;
        }

        console.log(`Seeking a path expression that will extract (at least) positions ` + 
        `${stringifyPosition(positionOfInterest)}-${stringifyPosition(endPositionOfInterest)} from ${filepathOfInterest}` + 
        `, qualified on the value including ${stringifyPosition(identifierPosition)}`);

        let pxe = project.context.pathExpressionEngine;
        let found: string;

        try {
            pxe.with<RichTextTreeNode>(fileOfInterest, grammarPX, top => {
            
                let nodeToRetrieve: TextTreeNode = smallestNodeThatContains([positionOfInterest, endPositionOfInterest], top.children() as TextTreeNode[]);
                let outerAddress = TreeHelper.findPathFromAncestor(nodeToRetrieve, tn => { return tn.nodeName() === top.nodeName() });

                let identifyingNode = smallestNodeThatContains([identifierPosition], nodeToRetrieve.children() as TextTreeNode[]);
               // console.log(`The identifying node is called ${identifyingNode.nodeName()}, with value ${identifyingNode.value()}`);

                let innerAddress = TreeHelper.findPathFromAncestor(identifyingNode, n => { return sameNode(n, nodeToRetrieve) })
               // console.log(`and inner address ${innerAddress}`)

                found = `${grammarPX}${outerAddress}[${innerAddress}[@value='${identifyingNode.value()}']]`;
                console.log(`This path expression:
                ${found}`);

            });
        }
        catch (e) {
            console.log(`problem: ${e}`);
            // e.printStackTrace();
        }

        if(found != null) {
            let result = pxe.evaluate(fileOfInterest, found);
            result.matches.forEach(m => {
                let t = m as TextTreeNode;
                console.log("yields: \n" + t.value());
            })
        }

    }
}

function samePointFormatInfo(pfi1: FormatInfo, pfi2: FormatInfo) {
    if (pfi1.start.offset != pfi2.start.offset) return false;
    if (pfi1.end.offset != pfi2.end.offset) return false;
    return true;
}

function sameNode(n1: TextTreeNode, n2: TextTreeNode) {
    // Rod: what's a better way to identify the relevant ancestor node?
    if (!samePointFormatInfo(n1.formatInfo, n2.formatInfo)) return false;
    if (n1.nodeName() !== n2.nodeName()) return false;
    return true;

}

function stringifyFormatInfo(pfi: FormatInfo): string {
    return `[${pfi.start.lineNumberFrom1},${pfi.start.columnNumberFrom1}]-[${pfi.end.lineNumberFrom1},${pfi.end.columnNumberFrom1}]`;
}

interface Position { line: number, column: number }

function stringifyPosition(pfi: Position): string {
    return `[${pfi.line},${pfi.column}]`;
}

function smallestNodeThatContains(pos: Position[], nodes: TextTreeNode[]): TextTreeNode {
    let c = nodes.filter(n => pos.every(p => contains(p, n)));
    if (c.length < 1) return null;
    let containing = c[0];
    if (containing.children().length == 0) return containing;
    let nextSmallest = smallestNodeThatContains(pos, containing.children() as TextTreeNode[])
    if (nextSmallest == null) return containing;
    return nextSmallest;
}

function after(start: PointFormatInfo, here: Position): boolean {
    if (here.line < start.lineNumberFrom1) return false;
    if (start.lineNumberFrom1 < here.line) return true;
    if (here.line < start.columnNumberFrom1) return false;
    return true;
}

function before(end: PointFormatInfo, here: Position): boolean {
    if (end.lineNumberFrom1 < here.line) return false;
    if (here.line < end.lineNumberFrom1) return true;
    if (end.columnNumberFrom1 < here.column) return false;
    return true;
}
function contains(pos: Position, node: TextTreeNode): boolean {
    return after(node.formatInfo.start, pos) && before(node.formatInfo.end, pos);
}

export const play = new Play();
