FROM openjdk:8-jre
MAINTAINER Alexander Lukyanchikov <sqshq@sqshq.com>

ADD ./target/statistics-service.jar /app/
CMD ["java", "-Xmx512m", "-Xms512m", "-verbose:gc", "-XX:+PrintGCDetails", "-XX:+PrintGCTimeStamps", "-Xloggc:/var/log/piggymetrics/gc.log", "-XX:+UseGCLogFileRotation", "-XX:NumberOfGCLogFiles=3", "-XX:GCLogFileSize=1m", "-jar", "/app/statistics-service.jar"]

EXPOSE 7000
