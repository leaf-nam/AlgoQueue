# base image
FROM eclipse-temurin:21-jdk-alpine

# working dir
WORKDIR /app

# set timezone
ENV TZ=Asia/Seoul

# copy jar file
COPY build/libs/algoqueue-*.jar app.jar

# entrypoint
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
