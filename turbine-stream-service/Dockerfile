FROM openjdk:8-jre
MAINTAINER Chi Dov <d.chiproeng@gmail.com>

ADD ./target/turbine-stream-service.jar /app/
CMD ["java", "-Xmx200m", "-Xms200m", "-verbose:gc", "-XX:+PrintGCDetails", "-XX:+PrintGCTimeStamps", "-Xloggc:/var/log/piggymetrics/gc.log", "-XX:+UseGCLogFileRotation", "-XX:NumberOfGCLogFiles=3", "-XX:GCLogFileSize=1m", "-jar", "/app/turbine-stream-service.jar"]

EXPOSE 8989
