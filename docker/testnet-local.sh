docker compose -f compose-demo-local.yaml build --build-arg ARCH=amd64 --no-cache && \

docker compose -f compose-demo-local.yaml down && \
docker compose -f compose-demo-local.yaml up -d