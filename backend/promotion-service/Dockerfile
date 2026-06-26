# syntax=docker/dockerfile:1.7
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,id=maven-repo,target=/root/.m2,sharing=locked mvn -B -ntp clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java","-jar","app.jar"]