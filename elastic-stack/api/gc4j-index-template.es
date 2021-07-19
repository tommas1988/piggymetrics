PUT _index_template/gc4j-template
{
# TODO: a better name pattern
# https://www.elastic.co/guide/en/fleet/7.13/data-streams.html#data-streams-naming-scheme
  "index_patterns": [
    "gc4j*"
  ],
# https://www.elastic.co/guide/en/elasticsearch/reference/7.13/index-templates.html#avoid-index-pattern-collisions
  "priority": 500,
  "data_stream": {},
  "template": {
    "settings": {
      "index.lifecycle.name": "gc4j-ilm-policy",
      "number_of_replicas": 1,
      "number_of_shards": 1
    },

    "mappings": {
      "date_detection": false,
      "dynamic_templates": [
        {
          "strings_as_keyword": {
            "mapping": {
              "ignore_above": 1024,
              "type": "keyword"
            },
            "match_mapping_type": "string"
          }
        }
      ],
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "GC4j": {
          "properties": {
            "GCType": {
              "ignore_above": 1024,
              "type": "keyword"
            },
            "Memory": {
              "properties": {
                "Heap": {
                  "properties": {
                    "AfterGC": {
                      "type": "long"
                    },
                    "BeforeGC": {
                      "type": "long"
                    },
                    "Total": {
                      "type": "long"
                    }
                  }
                },
                "Perm": {
                  "properties": {
                    "AfterGC": {
                      "type": "long"
                    },
                    "BeforeGC": {
                      "type": "long"
                    },
                    "Total": {
                      "type": "long"
                    }
                  }
                },
                "Tenured": {
                  "properties": {
                    "AfterGC": {
                      "type": "long"
                    },
                    "BeforeGC": {
                      "type": "long"
                    },
                    "Total": {
                      "type": "long"
                    }
                  }
                },
                "Young": {
                  "properties": {
                    "AfterGC": {
                      "type": "long"
                    },
                    "BeforeGC": {
                      "type": "long"
                    },
                    "Total": {
                      "type": "long"
                    }
                  }
                }
              }
            },
            "PauseTime": {
              "properties": {
                "Young": {
                  "type": "double"
                },
                "Tenured": {
                  "type": "double"
                },
                "Total": {
                  "type": "double"
                }
              }
            },
            "Timestamp": {
              "type": "double"
            }
          }
        },
        "ecs": {
          "properties": {
            "version": {
              "ignore_above": 1024,
              "type": "keyword"
            }
          }
        },
        "error": {
          "properties": {
            "code": {
              "ignore_above": 1024,
              "type": "keyword"
            },
            "id": {
              "ignore_above": 1024,
              "type": "keyword"
            },
            "message": {
              "norms": false,
              "type": "text"
            },
            "stack_trace": {
              "doc_values": false,
              "fields": {
                "text": {
                  "norms": false,
                  "type": "text"
                }
              },
              "ignore_above": 1024,
              "index": false,
              "type": "keyword"
            },
            "type": {
              "ignore_above": 1024,
              "type": "keyword"
            }
          }
        },
        "message": {
          "norms": false,
          "type": "text"
        }
      },
      "service": {
          "properties": {
            "node": {
              "properties": {
                "name": {
                  "ignore_above": 1024,
                  "type": "keyword"
                }
              }
            }
          }
        }
    }
  }
}
