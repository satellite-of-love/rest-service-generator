import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import { PathExpressionEngine } from '@atomist/rug/tree/PathExpression';
import { Pom } from '@atomist/rug/model/Pom';

let encryptedTokenParameterValidation = {
	pattern: Pattern.any,
	validInput: "alphanumeric",
	minLength: 1,
	maxLength: 1000
}
/**
 * Sample TypeScript editor used by AddMyFirstEditor.
 */
@Editor("PrepareTravisBuildFiles", "set up a satellite-of-love REST service on Travis")
@Tags("satellite-of-love", "travis")
export class PrepareTravisBuildFiles implements EditProject {


	@Parameter({
		...encryptedTokenParameterValidation,
		displayName: "encrypted github token",
		description: "travis-encrypted GITHUB_TOKEN=..."
	})
	encryptedGithubToken: string;

	@Parameter({
		...encryptedTokenParameterValidation,
		displayName: "encrypted atomist docker repo user",
		description: "travis-encrypted ATOMIST_REPO_USER=..."
	})
	encryptedDockerRegistryUser: string;

	@Parameter({
		...encryptedTokenParameterValidation,
		displayName: "encrypted atomist docker token",
		description: "travis-encrypted ATOMIST_REPO_TOKEN=..."
	})
	encryptedDockerRegistryToken: string;

	edit(project: Project) {
		console.log(`Enabling build on ${project.name}`);

		// .travis.yml
		if (!project.fileExists(".travis.yml")) {
			project.copyEditorBackingFileOrFail(".travis.yml");
		}

		// replace all secrets
		let travisFile = project.findFile(".travis.yml");
		let newContent = travisFile.content.replace(
			/\n.*- secure: .*\n/g, "\n").replace(
			"  global:",
			`  global:
  - secure: ${this.encryptedDockerRegistryToken}
  - secure: ${this.encryptedDockerRegistryUser}
  - secure: ${this.encryptedGithubToken}`);
        travisFile.setContent(newContent);

		// docker
		if (!project.fileExists("src/main/docker/Dockerfile")) {
			project.copyEditorBackingFileOrFail("src/main/docker/Dockerfile")
		}

		// build script
		if (!project.fileExists("src/main/scripts/travis-build.bash")) {
			project.copyEditorBackingFileOrFail("src/main/scripts/travis-build.bash");
		}

		// update the POM
		let eng: PathExpressionEngine = project.context.pathExpressionEngine;
		eng.with<Pom>(project, "/Pom()", pom => {
			pom.addOrReplaceBuildPlugin("org.apache.maven.plugins", "maven-dependency-plugin",
				`<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-dependency-plugin</artifactId>
				<version>2.10</version>
				<executions>
					<execution>
						<id>unpack</id>
						<phase>package</phase>
						<goals>
							<goal>unpack</goal>
						</goals>
						<configuration>
							<artifactItems>
								<artifactItem>
									<groupId>\${project.groupId}</groupId>
									<artifactId>\${project.artifactId}</artifactId>
									<version>\${project.version}</version>
									<type>jar</type>
									<outputDirectory>\${project.build.directory}/docker</outputDirectory>
								</artifactItem>
							</artifactItems>
						</configuration>
					</execution>
				</executions>
			</plugin>`);
			pom.addOrReplaceBuildPlugin("org.apache.maven.plugins", "maven-resources-plugin", `
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-resources-plugin</artifactId>
				<executions>
					<execution>
						<id>prepare-dockerfile</id>
						<phase>validate</phase>
						<goals>
							<goal>copy-resources</goal>
						</goals>
						<configuration>
							<outputDirectory>\${project.build.directory}/docker-filtered</outputDirectory>
							<resources>
								<resource>
									<directory>src/main/docker</directory>
									<filtering>true</filtering>
								</resource>
							</resources>
						</configuration>
					</execution>
				</executions>
			</plugin>`);
			pom.addOrReplaceBuildPlugin("com.spotify", "docker-maven-plugin", `
			<plugin>
				<groupId>com.spotify</groupId>
				<artifactId>docker-maven-plugin</artifactId>
				<version>0.4.12</version>
				<configuration>
					<imageName>sforzando-docker-dockerv2-local.artifactoryonline.com/\${project.name}</imageName>
					<dockerDirectory>\${project.build.directory}/docker-filtered</dockerDirectory>
					<resources>
						<resource>
							<targetPath>/</targetPath>
							<directory>\${project.build.directory}</directory>
							<include>\${project.build.finalName}.jar</include>
						</resource>
					</resources>
					<useConfigFile>true</useConfigFile>
					<imageTags>
						<imageTag>\${project.version}</imageTag>
					</imageTags>
				</configuration>
			</plugin>`);
		});
	}
}

export const prepareTravisBuildFiles = new PrepareTravisBuildFiles();
