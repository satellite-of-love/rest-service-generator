import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

/**
 * This implements a recommended security practice.
 * 
 * Teams may disregard or alter this change, as long as they comment about why.
 */
@Editor("RestrictCORS", "Add a restriction to CrossOrigin annotations")
@Tags("spring", "satellite-of-love", "security")
export class RestrictCORS implements EditProject {

    edit(project: Project) {

        let pxe = project.context.pathExpressionEngine;

        pxe.with<File>(project, "/src/main//File()", f => {
            if (f.name.match(/.java$/)) {
                f.replace("CrossOrigin()", `CrossOrigin(origins = "http://localhost:8080")`);
            }
        });

        project.describeChange(`This is a recommended change from your friendly security advisers.
        
        While allowing cross-origin requests is essential for some local testing, it is 
        otherwise discouraged by ... people. As long as your local front end is at localhost:8080,
        you'll be able to test.

        If there is a particular reason that your service should allow more requests (like, it's a public API)
        then please comment on this PR and then close it or remove individual endpoints' changes.
        `)
    }
}

export const restrictCORS = new RestrictCORS();
