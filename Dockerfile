FROM java:8

#RUN apt-get -y update && apt-get install -y curl git
RUN apt-get install -y curl git
RUN curl -Ss -L http://archive.apache.org/dist/ant/binaries/apache-ant-1.9.6-bin.tar.gz | tar xz
ENTRYPOINT ["/apache-ant-1.9.6/bin/ant"]
