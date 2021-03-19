# this docker file mainly use to fix healthcheck
# not working properly with docker compose.

From elasticsearch:7.10.1

HEALTHCHECK --interval=30s --timeout=30s CMD curl -f http://localhost:9200/ || exit 1
