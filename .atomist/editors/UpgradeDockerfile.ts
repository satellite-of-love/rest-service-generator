import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';

/**
 * upgrade the dockerfile to latest standards
 */
@Editor("UpgradeDockerfile", "make corrections to dockerfiles everywhere")
@Tags("satellite-of-love", "docker")
export class UpgradeDockerfile implements EditProject {

    edit(project: Project) {
        if (project.fileExists("src/main/docker/Dockerfile")) {
            let dockerfile = project.findFile("src/main/docker/Dockerfile");
            let newContents = dockerfile.content.replace(
                "FROM sforzando-docker-dockerv2-local.artifactoryonline.com/newrelic:0.5.0", "FROM java:8").replace(
                "-Xmx2g", "-Xmx200m"
                );
            dockerfile.setContent(newContents)
        }
    }
}

export const upgradeDockerfile = new UpgradeDockerfile();
