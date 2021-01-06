``` sh
$ cd .
$ docker build -t pm-mongodb:<version> .
$ docker run -v <host-path>:/data --env-file ../.env -d -p 27017:27017 pm-mongodb:<version>
```

**if dns not working in docker, try to disable firewall first**
