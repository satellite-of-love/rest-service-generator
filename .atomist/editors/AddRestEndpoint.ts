import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import * as RugGeneratorFunctions from '../generators/RugGeneratorFunctions';
import { RichTextTreeNode } from '@atomist/rug/ast/TextTreeNodeOps'

@Editor("AddRestEndpoint", "add an endpoint to return a POJO")
@Tags("spring", "satellite-of-love", "jess")
export class AddRestEndpoint implements EditProject {

    @Parameter({
        displayName: "Java return type",
        description: "type the endpoint will return",
        pattern: Pattern.java_class,
        validInput: "Java class name like ThunderCougarFalconBird",
        minLength: 1,
        maxLength: 100
    })
    returnedClass: string;

    @Parameter({
        displayName: "pojo field name",
        description: "name of a field in your pojo",
        pattern: Pattern.java_identifier,
        validInput: "Java identifier",
        minLength: 1,
        maxLength: 100
    })
    fieldName: string;

    @Parameter({
        displayName: "pojo field type",
        description: "type of that field in your pojo",
        pattern: Pattern.any,
        validInput: "Java type",
        minLength: 1,
        maxLength: 100
    })
    fieldType: string = "String";

    edit(project: Project) {
        let { applicationClass, packageName } = this.whereIsTheApplication(project);
        console.log(`Application is ${packageName}.${applicationClass}`)
        let sourceLocation = "src/main/java/com/jessitron" // hard-coded; please calculate
        let testLocation = "src/test/java/com/jessitron" // hard-coded; please calculate
        let lowerReturnedClass = this.uncapitalise(this.returnedClass);
        let path = lowerReturnedClass;
        let returnedClass = this.returnedClass;
        let requestParam = this.fieldName;
        let requestParamType = this.fieldType

        this.addPojo(project, sourceLocation, returnedClass, packageName, this.fieldName, this.fieldType);
        this.addController(project, sourceLocation, returnedClass, packageName, path, requestParam, requestParamType, lowerReturnedClass);
        this.addIntegrationTest(project, returnedClass, packageName, testLocation, requestParam, path, lowerReturnedClass, this.fieldName, this.fieldType, applicationClass);

        //TODO: these aren't working, directories need cleanup. (better would be to remove empties in changePackage)
        project.deleteDirectory("src/main/java/com/atomist/springrest");
        project.deleteDirectory("src/test/java/com/atomist/springrest");
    }

    private uncapitalise(str) {
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    }

    private capitalise(str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    private camelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }

    private whereIsTheApplication(project: Project) {
        let applicationClass = "ChangeMeApplication";
        let packageName = "com.jessitron";
        // I would love to do this with JavaFile path expressions but don't know how
        project.context.pathExpressionEngine.with<File>(project, "/src/main/java//File()", f => {
            if (f.name.match(/Application.java/) && f.contains("@SpringBootApplication")) {
                let classNameMatches = f.content.match(/public class ([A-Za-z0-9_]+) {/);
                if (classNameMatches && classNameMatches[1]) {
                    applicationClass = classNameMatches[1];
                }
            }
            let packageMatch = f.content.match(/^package ([\w\.]+);/);
            if (packageMatch && packageMatch[1]) {
                packageName = packageMatch[1];
            }
        })

        return {
            applicationClass: applicationClass,
            packageName: packageName
        };
    }

    private addPojo(project: Project, sourceLocation: string, returnedClass: string, packageName: string,
        fieldName: string, fieldType: string) {
        let pojoFilename = sourceLocation + `/${returnedClass}.java`
        if (project.fileExists(pojoFilename)) {
            console.log(`${pojoFilename} already exists, skipping`);
            return;
        }

        project.copyEditorBackingFileOrFail('src/main/java/com/atomist/springrest/addrestendpoint/OneEndpoint.java');
        RugGeneratorFunctions.movePackage(project, 'com.atomist.springrest.addrestendpoint', packageName);
        RugGeneratorFunctions.renameClass(project, 'OneEndpoint', returnedClass);

        let pojoFile = project.findFile(pojoFilename);
        if (pojoFile == null) {
            throw `this is bad, didn't find code at ${pojoFilename}`;
        }

        let newContents = pojoFile.content.replace(
            /OneParam/g, this.capitalise(fieldName)
        ).replace(
            /oneParam/g, fieldName
            ).replace(
            /String/g, fieldType
            );

        pojoFile.setContent(newContents);
    }

    private addIntegrationTest(project: Project, returnedClass: string, packageName: string,
        testLocation: string, requestParam: string, path: string, lowerReturnedClass: string,
        fieldName: string, fieldType: string, applicationClass: string) {
        let fileName = testLocation + `/${returnedClass}WebIntegrationTests.java`;
        if (project.fileExists(fileName)) {
            console.log("An integration test file exists already; TODO add a method to it");
            return;
        }

        let sourceFilename = 'src/test/java/com/atomist/springrest/addrestendpoint/OneEndpointWebIntegrationTests.java';
        project.copyEditorBackingFileOrFail(sourceFilename);

        let methodOfInterestMatches = project.context.pathExpressionEngine.evaluate(project.findFile(sourceFilename),
            `/JavaFile()//methodDeclaration[/methodHeader//Identifier[@value='oneEndpointTest']]`)
        if (methodOfInterestMatches.matches.length < 1) {
            console.log("Dang! Did not find the method!");
        } else {
            let methodText = (methodOfInterestMatches.matches[0] as RichTextTreeNode).value();
            console.log(`Here is the method text: ${methodText}`)
        }

        RugGeneratorFunctions.movePackage(project, 'com.atomist.springrest.addrestendpoint', packageName);
        RugGeneratorFunctions.renameClass(project, 'OneEndpointWebIntegrationTests', returnedClass + "WebIntegrationTests");

        let testFile = project.findFile(fileName);
        if (testFile == null) {
            // console.log("printing test sources...");
            // project.context.pathExpressionEngine.with<File>(project, "/src/test/java//File()", f => {
            //     console.log(f.path);
            // })
            throw `this is bad, didn't find test code at ${fileName}`;
        }

        let newContents = testFile.content.replace(
            /oneEndpoint/g, lowerReturnedClass
        ).replace(
            /OneEndpoint/g, returnedClass
            ).replace(
            /String oneParam/g, `${fieldType} ${fieldName}`
            ).replace(
            /oneParam/g, fieldName
            ).replace(
            /OneParam/g, this.capitalise(fieldName)
            ).replace(
            /import com.atomist.springrest.SpringRestApplication;\n/, ""
            ).replace(
            /SpringRestApplication/, applicationClass
            ).replace(
            /onePath/, path);
        console.log("application class is " + applicationClass);

        testFile.setContent(newContents);

    }

    private addController(project: Project, sourceLocation: string, returnedClass: string,
        packageName: string, path: string, requestParam: string, requestParamType: string, lowerReturnedClass: string) {
        let controllerFilename = sourceLocation + `/${returnedClass}Controller.java`;

        if (project.fileExists(controllerFilename)) {
            console.log("A controller file exists already; TODO add a method to it");
            return;
        }

        project.copyEditorBackingFileOrFail('src/main/java/com/atomist/springrest/addrestendpoint/OneEndpointController.java');
        RugGeneratorFunctions.movePackage(project, 'com.atomist.springrest.addrestendpoint', packageName);
        RugGeneratorFunctions.renameClass(project, 'OneEndpointController', returnedClass + "Controller");

        let controllerFile = project.findFile(controllerFilename);
        if (controllerFile == null) {
            // console.log("printing sources...");
            // project.context.pathExpressionEngine.with<File>(project, "/src/main/java//File()", f => {
            //     console.log(f.path);
            // })
            throw `this is bad, didn't find controller code at ${controllerFilename}. Thought I just put it there`;
        }

        let newContent = controllerFile.content.replace(
            /String oneParam/g, `${requestParamType} ${requestParam}`
        ).replace(
            /oneParam/g, requestParam
            ).replace(
            /onePath/g, path
            ).replace(
            /OneEndpoint/g, returnedClass
            ).replace(
            /oneEndpoint/, lowerReturnedClass);

        controllerFile.setContent(newContent);
    }

}

export const addRestEndpoint = new AddRestEndpoint();
