# Use Java 21 as base image
FROM eclipse-temurin:21-jdk

# Set working directory inside container
WORKDIR /myapp

# Copy Maven wrapper and config (adjust path)
COPY ../myapp/.mvn .mvn
COPY ../myapp/mvnw myapp/pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy the actual source code
COPY ../myapp/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/myapp-0.0.1-SNAPSHOT.jar"]
