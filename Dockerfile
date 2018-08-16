FROM openjdk:8u171-jdk as spigot-build

  # list of Spigot builds: https://hub.spigotmc.org/versions/
  # $ http https://hub.spigotmc.org/versions/1.13.1.json | jq -r .name
  ARG SPIGOT_BUILD=1865

  WORKDIR /build

  RUN curl -Ss -O https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar
  RUN java -jar BuildTools.jar --rev ${SPIGOT_BUILD}

FROM ubuntu:18.04

  ARG GRAALVM_VERSION=1.0.0-rc6

  RUN apt-get update && \
    apt-get install -y curl && \
    curl -Ls "https://github.com/oracle/graal/releases/download/vm-${GRAALVM_VERSION}/graalvm-ce-${GRAALVM_VERSION}-linux-amd64.tar.gz" | \
    tar zx -C /usr/local/ && \
    rm -f /usr/local/graalvm-ce-${GRAALVM_VERSION}/src.zip && \
    ln -s /usr/local/graalvm-ce-${GRAALVM_VERSION} /usr/local/graalvm && \
    rm -fr /var/lib/apt

  ENV PATH /usr/local/graalvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

  COPY --from=spigot-build /build/spigot-*.jar /server/

  RUN mkdir -p /server/plugins/scriptcraft \
   && echo 'extract-js: {plugins: false, modules: false, lib: false}' > /server/plugins/scriptcraft/config.yml

  WORKDIR /data

  RUN mkdir -p scriptcraft/data \
    && ln -s /server/scriptcraft/lib scriptcraft/ \
    && ln -s /server/scriptcraft/modules scriptcraft/ \
    && ln -s /server/scriptcraft/plugins scriptcraft/

  RUN echo 'eula=true' > eula.txt \
   && echo 'online-mode=false' > server.properties \
   && echo '{"verbose": true}' > scriptcraft/data/global-config.json \
   && echo '{"enableScripting": true}' > scriptcraft/data/classroom-store.json

  VOLUME /data

  EXPOSE 25565

  CMD ["java", "-Dfile.encoding=UTF-8", "-DIReallyKnowWhatIAmDoingISwear=true", \
       "-XX:-UseJVMCICompiler", "-Dpolyglot.js.nashorn-compat=true", \
       "-jar", "/server/spigot-1.13.1.jar", "--plugins", "/server/plugins"]
