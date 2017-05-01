import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import * as RugGeneratorFunctions from '../generators/RugGeneratorFunctions';
import { RichTextTreeNode } from '@atomist/rug/ast/TextTreeNodeOps'

@Editor("Play", "learn about editors")
@Tags( "satellite-of-love", "jess")
export class Play implements EditProject {

    edit(project: Project) {
       let filepathOfInterest = "src/test/java/com/jessitron/addrestendpoint/OneEndpointWebIntegrationTest.java";
       let fileOfInterest = project.findFile(filepathOfInterest);

       let pxe = project.context.pathExpressionEngine;

       pxe.with<RichTextTreeNode>(fileOfInterest, "/JavaFile()", top => {
           console.log(`Found top-level node: ${top.nodeName}`);
       })
   
    }


}

export const play = new Play();
