## Use ECS tool to generate index_template

### template settings
* use data stream to manage log data  https://www.elastic.co/guide/en/fleet/7.13/data-streams.html#data-streams-naming-scheme
* `"priority": 500` https://www.elastic.co/guide/en/elasticsearch/reference/7.13/index-templates.html#avoid-index-pattern-collisions

### Generate gc4j index template
``` sh
cd ${path_of_ecs}
$ build/ve/bin/python scripts/generator.py \
    --template-settings ${current_dir}/gc4j-template-settings.json \
    --subset ${current_dir}/gc4j-subset.yml \
    --include ${current_dir}/schemas/ \
    --out ${current_dir}/out/gc4j/ \
    --strict
```

Modify the generated file in ${current-dir}/out/gc4j/generated/elasticsearch/7/template.json to satisfy index template api after elasticsearch 7.8

**TODO: fixbug in ecs to generate files that satisfy version of elasticsearch after 7.8**

### Generate service index template
``` sh
cd ${path_of_ecs}
$ build/ve/bin/python scripts/generator.py \
    --template-settings ${current_dir}/service-template-settings.json \
    --subset ${current_dir}/service-log-subset.yml \
    --out ${current_dir}/out/service/ \
    --strict
```
