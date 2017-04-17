import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

/**
 * Sample TypeScript editor used by AddRestrictCORS.
 */
@Editor("RestrictCORS", "Add a restriction to CrossOrigin annotations")
@Tags("documentation")
export class RestrictCORS implements EditProject {

    edit(project: Project) {
        project.addFile("hello.txt", "Hello, World!\n" + this.inputParameter + "\n");
    }
}

export const restrictCORS = new RestrictCORS();
