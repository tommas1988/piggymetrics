PUT _index_template/service-log-template
{
  "data_stream": {},
  "index_patterns": [
    "service-log-*"
  ],
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
n              "text": {
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
      "log": {
        "properties": {
          "file": {
            "properties": {
              "path": {
                "ignore_above": 1024,
                "type": "keyword"
              }
            }
          },
          "level": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "logger": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "origin": {
            "properties": {
              "file": {
                "properties": {
                  "line": {
                    "type": "integer"
                  },
                  "name": {
                    "ignore_above": 1024,
                    "type": "keyword"
                  }
                }
              },
              "function": {
                "ignore_above": 1024,
                "type": "keyword"
              }
            }
          },
          "original": {
            "doc_values": false,
            "ignore_above": 1024,
            "index": false,
            "type": "keyword"
          },
          "syslog": {
            "properties": {
              "facility": {
                "properties": {
                  "code": {
                    "type": "long"
                  },
                  "name": {
                    "ignore_above": 1024,
                    "type": "keyword"
                  }
                }
              },
              "priority": {
                "type": "long"
              },
              "severity": {
                "properties": {
                  "code": {
                    "type": "long"
                  },
                  "name": {
                    "ignore_above": 1024,
                    "type": "keyword"
                  }
                }
              }
            },
            "type": "object"
          }
        }
      },
      "message": {
        "norms": false,
        "type": "text"
      },
      "service": {
        "properties": {
          "ephemeral_id": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "id": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "name": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "node": {
            "properties": {
              "name": {
                "ignore_above": 1024,
                "type": "keyword"
              }
            }
          },
          "state": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "type": {
            "ignore_above": 1024,
            "type": "keyword"
          },
          "version": {
            "ignore_above": 1024,
            "type": "keyword"
          }
        }
      },
      "span": {
        "properties": {
          "id": {
            "ignore_above": 1024,
            "type": "keyword"
          }
        }
      },
      "trace": {
        "properties": {
          "id": {
            "ignore_above": 1024,
            "type": "keyword"
          }
        }
      },
      "transaction": {
        "properties": {
          "id": {
            "ignore_above": 1024,
            "type": "keyword"
          }
        }
      }
    }
  },
  "order": 1,
  "priority": 500,
  "template": {
    "settings": {
      "index.lifecycle.name": "service-log-ilm-policy",
      "number_of_replicas": 1,
      "number_of_shards": 1
    }
  }
}
