FROM sforzando-docker-dockerv2-local.artifactoryonline.com/newrelic:0.5.0

COPY org /opt/build/org
COPY BOOT-INF/lib /opt/build/BOOT-INF/lib
COPY META-INF /opt/build/META-INF
COPY BOOT-INF/classes /opt/build/BOOT-INF/classes

WORKDIR /opt/build/

EXPOSE 8080

CMD ["java", "-Xmx2g", "org.springframework.boot.loader.JarLauncher"]
