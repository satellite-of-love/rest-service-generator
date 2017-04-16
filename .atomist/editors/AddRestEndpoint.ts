import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

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
        description: "name of a field in your pojo, blank for none (or not a new pojo)",
        pattern: Pattern.java_identifier,
        validInput: "Java identifier",
        minLength: 1,
        maxLength: 100
    })
    fieldName: string = "";

    @Parameter({
        displayName: "pojo field type",
        description: "type of that field in your pojo, blank for none (or not a new pojo)",
        pattern: Pattern.any,
        validInput: "Java type",
        minLength: 1,
        maxLength: 100
    })
    fieldType: string = "";

    edit(project: Project) {
        let packageName = `com.jessitron` // todo: figure this out
        let sourceLocation = "src/main/java/com/jessitron"
        let testLocation = "src/test/java/com/jessitron"
        let lowerReturnedClass = this.uncapitalise(this.returnedClass);
        let path = lowerReturnedClass;
        let returnedClass = this.returnedClass;
        let requestParam = this.fieldName;
        let requestParamType = this.fieldType

        this.addPojo(project, sourceLocation, returnedClass, packageName, this.fieldName, this.fieldType);
        this.addController(project, sourceLocation, returnedClass, packageName, path, requestParam, requestParamType, lowerReturnedClass);
        this.addIntegrationTest(project, returnedClass, packageName, testLocation, requestParam, path, lowerReturnedClass, this.fieldName);

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

    private addPojo(project: Project, sourceLocation: string, returnedClass: string, packageName: string,
        fieldName: string, fieldType: string) {
        let pojoFile = sourceLocation + `/${returnedClass}.java`
        if (project.fileExists(pojoFile)) {
            console.log(`${pojoFile} already exists, skipping`);
            return;
        }

        let fieldMethods = "";
        if (fieldName != "" && fieldType != "") {
            fieldMethods = `
    private ${fieldType} ${fieldName};

    public ${returnedClass}(${fieldType} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }

    public ${fieldType} get${this.capitalise(fieldName)} () {
        return ${fieldName};
    }

    public void set${this.capitalise(fieldName)} (${fieldType} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }
`
        }

        let pojoContents =
            `package ${packageName};

public class ${returnedClass} {
    ${fieldMethods}
    // don't forget the default constructor. Jackson likes it
    public ${returnedClass} () {}
}
`
        project.addFile(pojoFile, pojoContents);

    }

    private addIntegrationTest(project: Project, returnedClass: string, packageName: string,
        testLocation: string, requestParam: string, path: string, lowerReturnedClass: string,
        fieldName: string) {
        let fileName = testLocation + `/${returnedClass}WebIntegrationTests.java`;
        let params = "";
        if (requestParam != "") {
            params = `?${requestParam}=hello`;
        }
        let method =
            `
    @Test
    public void ${lowerReturnedClass}Test() {
        ${returnedClass} result = restTemplate.getForObject(BASE_PATH + "/${path}${params}", ${returnedClass}.class);
        assertEquals("hello", result.get${this.capitalise(fieldName)}());
    }
    `;
        if (project.fileExists(fileName)) {
            let endOfClassDeclaration = /^}/;
            let file = project.findFile(fileName);
            let newContent = file.content.replace(endOfClassDeclaration,
                "\n" + method + "\n}")
            file.setContent(newContent);
        } else {
            let applicationClass = "ChangeMe"; // TODO: I have to use a path expression to find it, and that's a mode switch


            // It would be better to retrieve my template content and modify it
            let fileContent =
                `package ${packageName};

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = ${applicationClass}Application.class, webEnvironment = WebEnvironment.DEFINED_PORT)
public class ${returnedClass}WebIntegrationTests {

    private static final int PORT = 8080;

    private static final String BASE_PATH = "http://localhost:" + PORT;

    private RestTemplate restTemplate = new RestTemplate();

    ${method}
}
`
            project.addFile(fileName, fileContent);
        }

    }

    private addController(project: Project, sourceLocation: string, returnedClass: string,
        packageName: string, path: string, requestParam: string, requestParamType: string, lowerReturnedClass: string) {
        let controllerFile = sourceLocation + `/${returnedClass}Controller.java`;
        let params = "";
        let pojoField = "";
        if (requestParam != "") {
            params = `@RequestParam(value = "${requestParam}") ${requestParamType} ${requestParam}`;
            pojoField = requestParam;
        }
        let controllerMethod =
            `
    @CrossOrigin()
    @RequestMapping(path = "/${path}")
    public ${returnedClass} ${lowerReturnedClass}(${params}) {
        return new ${returnedClass}(${pojoField});
    }
`;
        if (project.fileExists(controllerFile)) {
            let beginningOfClassDeclaration = `${returnedClass}Controller {`;
            project.replace(beginningOfClassDeclaration, beginningOfClassDeclaration + "\n" + controllerMethod);
        } else {
            let controllerContent =
                `package ${packageName};

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ${returnedClass}Controller {
${controllerMethod}
}
    ` // syntax highlighting is confused so `
            project.addFile(controllerFile, controllerContent);
        }
    }

}

export const addRestEndpoint = new AddRestEndpoint();
