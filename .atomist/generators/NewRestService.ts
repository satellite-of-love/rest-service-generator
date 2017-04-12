import { PopulateProject } from '@atomist/rug/operations/ProjectGenerator';
import { File } from '@atomist/rug/model/File';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Pom } from '@atomist/rug/model/Pom';
import { PathExpressionEngine } from '@atomist/rug/tree/PathExpression';
import { JavaSource } from '@atomist/rug/model/JavaSource';
import { JavaType } from '@atomist/rug/model/JavaType';
import { Generator, Parameter, Tags } from '@atomist/rug/operations/Decorators';

/**
 * Sample TypeScript generator used by AddNewRestService.
 */
@Generator("NewRestService", "a standard REST service for satellite-of-love")
@Tags("documentation")
export class NewRestService implements PopulateProject {

    private

    @Parameter({
        displayName: "Project description",
        description: "what does it do?",
        pattern: Pattern.any,
        validInput: "a nice string, up to 100 chars",
        minLength: 1,
        maxLength: 100,
        required: false
    })
    description: string = "Mystery Project";

    populate(project: Project) {
        console.log(`Creating ${project.name()}: ${this.description}`);
        let camelCaseName = this.camelCase(project.name())

        this.alterReadme(project, this.description);
        this.cleanChangeLog(project);
        project.deleteFile(".travis.yml");
        this.movePackage(project, "com.jessitron.restServiceGenerator", `com.jessitron.${camelCaseName}`)
        this.renameClass(project, "SurveyOptions", camelCaseName);
    }

    private alterReadme(project: Project, description: string) {
        let readMe: File = project.findFile("README.md");
        readMe.replace("REST Service Generator", project.name());
        // Take out the bits about Rugs
        readMe.regexpReplace("## Rugs[\\s\\S]*?\n## Development",
            `${description}\n##Development`);
    }

    private cleanChangeLog(project: Project): void {
        let changeLog: File = project.findFile("CHANGELOG.md");
        changeLog.regexpReplace("\\d+\\.\\d+\\.\\d+\\.\\.\\.HEAD\n\n[\\S\\s]*## \\[1\\.0\\.0\\]", "1.0.0...HEAD\n\n## [1.0.0]");
        changeLog.regexpReplace("\n### Added[\\S\\s]*", "\nAdded\n\n-   Everything\n");
        changeLog.replace("rest-service-generator", project.name());
    }

    private updatePom(project: Project, description: string): void {
        let eng: PathExpressionEngine = project.context().pathExpressionEngine();
        eng.with<Pom>(project, "/Pom()", pom => {
            pom.setArtifactId(project.name());
            pom.setProjectName(project.name());
            pom.setVersion("1.0.0");
            pom.setDescription(description);
        });
    }

    private movePackage(project: Project, oldPackage: string, newPackage: string): void {
        let eng: PathExpressionEngine = project.context().pathExpressionEngine();
        eng.with<JavaSource>(project, `//JavaSource()[.pkg()='${oldPackage}']`, j => {
            j.movePackage(newPackage);
        });
    }

    private renameClass(project: Project, oldClass: string, newClass: string): void {
        let eng: PathExpressionEngine = project.context().pathExpressionEngine();
        eng.with<JavaType>(project, `//JavaType()`, j => {
            if (j.name().indexOf(oldClass) >= 0) {
                j.renameByReplace(oldClass, newClass);
            }
        });
        project.replace(oldClass, newClass);
    }

    // todo: pull this out (and maybe replace with something clearer that I didn't copy)
    private camelCase(str: string) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/[\s-_]+/g, '');
    }
}

export const newRestService = new NewRestService();
