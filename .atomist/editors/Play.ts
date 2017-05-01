import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import * as RugGeneratorFunctions from '../generators/RugGeneratorFunctions';
import { RichTextTreeNode } from '@atomist/rug/ast/TextTreeNodeOps';
import { TextTreeNode, PointFormatInfo } from '@atomist/rug/tree/PathExpression';
import * as TreeHelper from '@atomist/rug/tree/TreeHelper';

@Editor("Play", "learn about editors")
@Tags("satellite-of-love", "jess")
export class Play implements EditProject {

    edit(project: Project) {
        let positionOfInterest: Position = { line: 25, column: 17, };
        let filepathOfInterest = "src/test/java/com/atomist/springrest/addrestendpoint/OneEndpointWebIntegrationTests.java";
        let fileOfInterest = project.findFile(filepathOfInterest);
        if (fileOfInterest == null) {
            throw `File not found: ${filepathOfInterest}`;
        }

        let pxe = project.context.pathExpressionEngine;

        try {
            pxe.with<RichTextTreeNode>(fileOfInterest, "/JavaFile()", top => {
                console.log(`Found top-level node: ${top.nodeName()}`); // TODO: ask Rod - why is that still a function?

                let someNode: TextTreeNode = smallestNodeThatContains(positionOfInterest, top.children() as TextTreeNode[]);

                 console.log(`Here is some interior node: ${TreeHelper.stringify(someNode)} at ${someNode.formatInfo}`);


                 console.log(`Does it contain ${JSON.stringify(positionOfInterest)}? ${contains(positionOfInterest, someNode)}`);
                

            });
        }
        catch (e) {
            console.log(`problem: ${e}`);
        }

    }
}

interface Position { line: number, column: number }

function smallestNodeThatContains(pos: Position, nodes: TextTreeNode[]): TextTreeNode {
    let c = nodes.filter(n => contains(pos, n))
    if (c.length < 1) throw `no node contained it`
    let containing = c[0];
    if (containing.children().length == 0) return containing;
    return smallestNodeThatContains(pos, containing.children() as TextTreeNode[])
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
