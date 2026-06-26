# ===== Build Stage =====
FROM gradle:8.14-jdk21-alpine AS builder

WORKDIR /build

COPY . .

RUN gradle bootJar --no-daemon

# ===== Runtime Stage =====
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY --from=builder /build/build/libs/*.jar app.jar

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]