``` sh
$ docker run -d -p 9411:9411 -e STORAGE_TYPE=elasticsearch -e ES_HOSTS=http://<host>:9200 -e RABBIT_ADDRESSES=<host>:5672 -e RABBIT_QUEUE=zipkin openzipkin/zipkin
$ docker run -d -e STORAGE_TYPE=elasticsearch -e ES_HOSTS=http://<host>:9200 openzipkin/zipkin-dependencies
```
