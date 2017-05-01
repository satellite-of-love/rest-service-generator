import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import * as RugGeneratorFunctions from '../generators/RugGeneratorFunctions';
import { RichTextTreeNode } from '@atomist/rug/ast/TextTreeNodeOps';
import * as TreeHelper from '@atomist/rug/tree/TreeHelper';

@Editor("Play", "learn about editors")
@Tags("satellite-of-love", "jess")
export class Play implements EditProject {

    edit(project: Project) {
        let filepathOfInterest = "src/test/java/com/atomist/springrest/addrestendpoint/OneEndpointWebIntegrationTests.java";
        let fileOfInterest = project.findFile(filepathOfInterest);
        if (fileOfInterest == null) {
            throw `File not found: ${filepathOfInterest}`;
        }

        let pxe = project.context.pathExpressionEngine;

        try {
            pxe.with<RichTextTreeNode>(fileOfInterest, "/JavaFile()", top => {
                console.log(`Found top-level node: ${TreeHelper.stringify(top)}`);
            });
        }
        catch (e) {
            console.log(`problem: ${e}`);
        }

    }


}

export const play = new Play();
