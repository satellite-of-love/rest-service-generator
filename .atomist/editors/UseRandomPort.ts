import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { File } from '@atomist/rug/model/File';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';


/*
 * We have encountered a failing build in a brand-new service,
 * which was about port already in use.
 * Using random ports in WebIntegrationTests keeps them from
 * running into each other (most of the time).
 * This is recommended: 
 * https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications-working-with-random-ports
 * 
 * Update projects originally created from this generator when it used defined ports, 
 * to use random ports in these tests.
 */

@Editor("UseRandomPort", "change WebIntegrationTests from DEFINED_PORT to RANDOM_PORT")
@Tags("spring", "satellite-of-love", "jess")
export class UseRandomPort implements EditProject {

    edit(project: Project) {

        project.describeChange(`A pull request from your friendly architecture team. 
This is some information some teams have learned the hard way:
Using a random port can reduce build failures.
See: https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html#boot-features-testing-spring-boot-applications-working-with-random-ports

This automated pull request attempts to change defined ports to random ports in Web Integration tests.
Please review the changes and see whether they make sense for your project. Contact @jessitron in Slack with feedback either way.
This change is optional; take it or leave it; it probably won't hurt and might help.
`)

        let pxe = project.context.pathExpressionEngine;
        pxe.with<File>(project, "/src/test//File()", f => {
            if (/WebIntegrationTests.java$/.exec(f.name) && /WebEnvironment.DEFINED_PORT/.exec(f.content)) {
                console.log(`Changing DEFINED_PORT to RANDOM_PORT in file ${f.name} in ${project.name}`)

                f.replace("WebEnvironment.DEFINED_PORT", "WebEnvironment.RANDOM_PORT");
                f.regexpReplace("private static final int PORT.*\n", ""); // no more defined port
                f.replace("// Parameterize tests like this\n", ""); // this was in the template before
                f.regexpReplace(`.*BASE_PATH = .*PORT;\n`, ""); // replace this with magic
                f.replace("BASE_PATH", `"/"`); // this may not be correct for all projects, there may be more to it. People can correct in their own PRs for now

                f.replace("private RestTemplate restTemplate = new RestTemplate();", "@Autowired\n    private TestRestTemplate restTemplate;"); // Here is the magic!
                f.replace("import org.springframework.web.client.RestTemplate;", 
                "import org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.web.client.TestRestTemplate;")
            };
        })
    }

}

export const useRandomPort = new UseRandomPort();
