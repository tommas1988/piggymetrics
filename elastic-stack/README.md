# ELK stack & Elastic Stack

## elasticsearch
``` sh
$ docker run --name elasticsearch -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.10.1
```

## kibana
``` sh
$ docker run --name kibana -d -p 5601:5601 --link elasticsearch:elasticsearch kibana:7.10.1
```
