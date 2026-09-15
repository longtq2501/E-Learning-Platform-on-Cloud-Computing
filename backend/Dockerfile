# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom first (layer caching: dependencies don't change often)
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached unless pom.xml changes)
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B --no-transfer-progress

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests -B --no-transfer-progress

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy built artifact from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
	CMD wget -qO- http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
