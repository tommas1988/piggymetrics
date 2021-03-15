FROM openjdk:8-jre
MAINTAINER Alexander Lukyanchikov <sqshq@sqshq.com>

ADD ./target/notification-service.jar /app/
CMD ["java", "-Xmx200m", "-Xms200m", "-verbose:gc", "-XX:+PrintGCDetails", "-XX:+PrintGCTimeStamps", "-Xloggc:logs/gc.log", "-XX:+UseGCLogFileRotation", "-XX:NumberOfGCLogFiles=3", "-XX:GCLogFileSize=1m", "-jar", "/app/notification-service.jar"]

EXPOSE 8000
